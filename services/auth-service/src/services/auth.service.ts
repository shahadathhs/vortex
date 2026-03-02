import crypto from 'crypto';

import {
  BadRequestError,
  ConfirmChannel,
  ConflictError,
  generateToken,
  logger,
  NotFoundError,
  RabbitMQManager,
  UnauthorizedError,
} from '@vortex/common';

import { env, jwtSecret } from '../config/config';
import { publishPasswordResetRequested } from '../lib/password-reset.events';
import { User } from '../models/User';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { IUser } from '../types/user.interface';

const rabbitMQ = RabbitMQManager.getConnection(env.RABBITMQ_URL);

function generateAccessToken(user: IUser) {
  return generateToken(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    jwtSecret,
  );
}

function generateRefreshToken(_user: IUser) {
  return crypto.randomBytes(40).toString('hex');
}

async function publishUserCreatedEvent(user: IUser) {
  try {
    const channelWrapper = rabbitMQ.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange('vortex', 'topic', { durable: true });
      },
    });

    const payload = {
      event: 'user.created',
      timestamp: new Date(),
      data: {
        userId: String(user._id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    await channelWrapper.publish('vortex', 'user.created', payload);

    logger.info('📤 Published user.created event');
  } catch (error) {
    logger.error('Failed to publish user.created event:', error);
  }
}

async function register(data: RegisterInput) {
  const { email, password, firstName, lastName } = data;

  const existingUser = await User.findOne({
    email,
    isDeleted: { $ne: true },
  });
  if (existingUser) {
    throw new ConflictError('User already exists');
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: 'customer',
  });

  await publishUserCreatedEvent(user);

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    message: 'User registered successfully',
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
    refreshToken,
  };
}

async function login(data: LoginInput) {
  const { email, password } = data;
  const user = await User.findOne({ email, isDeleted: { $ne: true } });

  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive');
  }

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

async function refreshToken(oldRefreshToken: string) {
  const user = await User.findOne({
    refreshToken: oldRefreshToken,
    isDeleted: { $ne: true },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const token = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { token, refreshToken: newRefreshToken };
}

async function getProfile(userId: string) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  })
    .select('-password -refreshToken')
    .lean();

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return { user };
}

async function updateProfile(
  userId: string,
  data: { firstName?: string; lastName?: string },
) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (data.firstName !== undefined) user.firstName = data.firstName;
  if (data.lastName !== undefined) user.lastName = data.lastName;
  await user.save();

  return { user: user.toProfileJSON() };
}

async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  await user.updatePassword(newPassword);

  return { message: 'Password updated successfully' };
}

async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshToken: undefined });
  return { message: 'Logged out successfully' };
}

async function fetchUserForAuth(
  userId: string,
): Promise<{ isActive?: boolean } | null> {
  const user = await User.findById(userId).select('isActive isDeleted').lean();
  if (!user || user.isDeleted) return null;
  return { isActive: user.isActive };
}

async function createAdmin(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const existingUser = await User.findOne({
    email: data.email,
    isDeleted: { $ne: true },
  });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const user = await User.create({
    ...data,
    role: 'admin',
  });

  logger.info(`Admin created: ${user.email} by superadmin`);

  return {
    message: 'Admin created successfully',
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

async function deleteAdmin(adminId: string) {
  const user = await User.findOne({
    _id: adminId,
    isDeleted: { $ne: true },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  if (user.role !== 'admin') {
    throw new BadRequestError('Can only delete users with admin role');
  }

  user.isDeleted = true;
  user.isActive = false;
  user.refreshToken = undefined;
  await user.save();
  logger.info(`Admin deleted: ${user.email} by superadmin`);
  return { message: 'Admin deleted successfully' };
}

async function listAdmins() {
  const admins = await User.find({ role: 'admin', isDeleted: { $ne: true } })
    .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 });
  return { admins };
}

async function forgotPassword(email: string): Promise<{ message: string }> {
  const user = await User.findOne({ email, isDeleted: { $ne: true } });
  if (!user) {
    return { message: 'If the email exists, a reset link will be sent' };
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = expires;
  await user.save();

  const appUrl = env.APP_URL;
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  await publishPasswordResetRequested(env.RABBITMQ_URL, {
    email: user.email,
    resetToken,
    resetUrl,
  });
  return { message: 'If the email exists, a reset link will be sent' };
}

async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const user = await User.findOne({
    passwordResetToken: token,
    isDeleted: { $ne: true },
  });
  if (
    !user ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < new Date()
  ) {
    throw new BadRequestError('Invalid or expired reset token');
  }
  await user.updatePassword(newPassword);
  return { message: 'Password reset successfully' };
}

async function resetUserPassword(
  targetUserId: string,
  newPassword: string,
): Promise<{ message: string }> {
  const user = await User.findOne({
    _id: targetUserId,
    isDeleted: { $ne: true },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  logger.info(`Password reset for ${user.email} by superadmin`);

  return { message: 'Password reset successfully' };
}

export const authService = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  updatePassword,
  logout,
  forgotPassword,
  resetPasswordWithToken,
  fetchUserForAuth,
  createAdmin,
  deleteAdmin,
  listAdmins,
  resetUserPassword,
};
