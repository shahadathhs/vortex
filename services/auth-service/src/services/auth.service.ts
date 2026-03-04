import crypto from 'crypto';

import type { ConfirmChannel } from 'amqplib';

import {
  BadRequestError,
  ConflictError,
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  generateToken,
  generateTokenWithExpiry,
  logger,
  NotFoundError,
  RabbitMQManager,
  UnauthorizedError,
  verifyToken,
} from '@vortex/common';
import bcrypt from 'bcryptjs';

import { config } from '../config/config';
import { publishPasswordResetRequested } from '../lib/password-reset.events';
import { publishTfaOtpRequested } from '../lib/tfa.events';
import { User } from '../models/User';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { IUser } from '../types/user.interface';

const rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

function generateAccessToken(user: IUser): string {
  return generateToken(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    config.JWT_SECRET,
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
        await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, {
          durable: true,
        });
      },
    });

    const payload = {
      event: EventName.USER_CREATED,
      timestamp: new Date(),
      data: {
        userId: String(user._id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    await channelWrapper.publish(EXCHANGE, EventName.USER_CREATED, payload);

    logger.info(`📤 Published ${EventName.USER_CREATED} event`);
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
    role: 'buyer',
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

  if (user.tfaEnabled) {
    const otp = crypto.randomInt(100000, 999999).toString();
    user.tfaOtpHash = await bcrypt.hash(otp, 10);
    user.tfaOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await publishTfaOtpRequested(config.RABBITMQ_URL, {
      email: user.email,
      otp,
      purpose: 'login',
    });

    const tfaToken = generateTokenWithExpiry(
      { id: String(user._id), purpose: 'tfa_pending' },
      config.JWT_SECRET,
      '5m',
    );

    return {
      requiresTfa: true,
      tfaToken,
      message: 'OTP sent to your email. Verify to complete login.',
    };
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

async function createSeller(data: {
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
    role: 'seller',
  });

  logger.info(`Seller created: ${user.email} by system`);

  return {
    message: 'Seller created successfully',
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}

async function deleteSeller(sellerId: string) {
  const user = await User.findOne({
    _id: sellerId,
    isDeleted: { $ne: true },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  if (user.role !== 'seller') {
    throw new BadRequestError('Can only delete users with seller role');
  }

  user.isDeleted = true;
  user.isActive = false;
  user.refreshToken = undefined;
  await user.save();
  logger.info(`Seller deleted: ${user.email} by system`);
  return { message: 'Seller deleted successfully' };
}

async function getUserById(userId: string) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  })
    .select('-password -refreshToken')
    .lean();
  if (!user) return null;
  return user;
}

async function updateStripeAccount(
  userId: string,
  data: { stripeAccountId?: string; stripeOnboardingComplete?: boolean },
) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  if (data.stripeAccountId !== undefined)
    user.stripeAccountId = data.stripeAccountId;
  if (data.stripeOnboardingComplete !== undefined)
    user.stripeOnboardingComplete = data.stripeOnboardingComplete;
  await user.save();
  return user;
}

async function updateStripeOnboardingByAccountId(stripeAccountId: string) {
  const user = await User.findOneAndUpdate(
    { stripeAccountId, isDeleted: { $ne: true } },
    { $set: { stripeOnboardingComplete: true } },
    { new: true },
  );
  return user;
}

async function listSellers() {
  const sellers = await User.find({ role: 'seller', isDeleted: { $ne: true } })
    .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
    .sort({ createdAt: -1 });
  return { sellers };
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

  const appUrl = config.APP_URL;
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  await publishPasswordResetRequested(config.RABBITMQ_URL, {
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

async function enableTfa(userId: string) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });
  if (!user) throw new NotFoundError('User not found');
  if (user.tfaEnabled) throw new BadRequestError('TFA is already enabled');

  const otp = crypto.randomInt(100000, 999999).toString();
  user.tfaOtpHash = await bcrypt.hash(otp, 10);
  user.tfaOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await publishTfaOtpRequested(config.RABBITMQ_URL, {
    email: user.email,
    otp,
    purpose: 'enable',
  });

  return { message: 'OTP sent to your email. Verify to enable TFA.' };
}

async function verifyTfaEnable(userId: string, otp: string) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });
  if (!user) throw new NotFoundError('User not found');
  if (user.tfaEnabled) throw new BadRequestError('TFA is already enabled');
  if (!user.tfaOtpHash || !user.tfaOtpExpires) {
    throw new BadRequestError('No pending OTP. Request a new one.');
  }
  if (user.tfaOtpExpires < new Date()) {
    user.tfaOtpHash = undefined;
    user.tfaOtpExpires = undefined;
    await user.save();
    throw new BadRequestError('OTP expired. Request a new one.');
  }

  const valid = await bcrypt.compare(otp, user.tfaOtpHash);
  if (!valid) throw new UnauthorizedError('Invalid OTP');

  user.tfaEnabled = true;
  user.tfaOtpHash = undefined;
  user.tfaOtpExpires = undefined;
  await user.save();

  return { message: 'TFA enabled successfully' };
}

async function verifyTfaLogin(tfaToken: string, otp: string) {
  let decoded: { id?: string; purpose?: string };
  try {
    decoded = verifyToken(tfaToken, config.JWT_SECRET) as {
      id?: string;
      purpose?: string;
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired TFA token');
  }
  if (decoded.purpose !== 'tfa_pending' || !decoded.id) {
    throw new UnauthorizedError('Invalid TFA token');
  }

  const user = await User.findOne({
    _id: decoded.id,
    isDeleted: { $ne: true },
  });
  if (!user) throw new NotFoundError('User not found');
  if (!user.tfaEnabled) throw new BadRequestError('TFA is not enabled');
  if (!user.tfaOtpHash || !user.tfaOtpExpires) {
    throw new BadRequestError('OTP expired. Please login again.');
  }
  if (user.tfaOtpExpires < new Date()) {
    user.tfaOtpHash = undefined;
    user.tfaOtpExpires = undefined;
    await user.save();
    throw new BadRequestError('OTP expired. Please login again.');
  }

  const valid = await bcrypt.compare(otp, user.tfaOtpHash);
  if (!valid) throw new UnauthorizedError('Invalid OTP');

  user.tfaOtpHash = undefined;
  user.tfaOtpExpires = undefined;
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

async function disableTfa(userId: string, password: string) {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  });
  if (!user) throw new NotFoundError('User not found');
  if (!user.tfaEnabled) throw new BadRequestError('TFA is not enabled');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError('Password is incorrect');

  user.tfaEnabled = false;
  user.tfaOtpHash = undefined;
  user.tfaOtpExpires = undefined;
  await user.save();

  return { message: 'TFA disabled successfully' };
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

  logger.info(`Password reset for ${user.email} by system`);

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
  enableTfa,
  verifyTfaEnable,
  verifyTfaLogin,
  disableTfa,
  fetchUserForAuth,
  getUserById,
  updateStripeAccount,
  updateStripeOnboardingByAccountId,
  createSeller,
  deleteSeller,
  listSellers,
  resetUserPassword,
};
