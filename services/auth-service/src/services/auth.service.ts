import crypto from 'crypto';

import {
  BadRequestError,
  ConflictError,
  ConfirmChannel,
  generateToken,
  logger,
  NotFoundError,
  RabbitMQManager,
  UnauthorizedError,
} from '@vortex/common';

import { config } from '../config/config';
import { User } from '../models/User';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { IUser } from '../types/user.interface';

export class AuthService {
  private rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  async register(data: RegisterInput) {
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

    // Publish user.created event
    await this.publishUserCreatedEvent(user);

    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

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

  async login(data: LoginInput) {
    const { email, password } = data;
    const user = await User.findOne({ email, isDeleted: { $ne: true } });

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

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

  async refreshToken(oldRefreshToken: string) {
    const user = await User.findOne({
      refreshToken: oldRefreshToken,
      isDeleted: { $ne: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { token, refreshToken };
  }

  async getProfile(userId: string) {
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

  async updateProfile(
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

  async updatePassword(
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

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
    return { message: 'Logged out successfully' };
  }

  /** Fetch user for protect middleware (check existence + isActive) */
  async fetchUserForAuth(
    userId: string,
  ): Promise<{ isActive?: boolean } | null> {
    const user = await User.findById(userId)
      .select('isActive isDeleted')
      .lean();
    if (!user || user.isDeleted) return null;
    return { isActive: user.isActive };
  }

  async createAdmin(data: {
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

  async deleteAdmin(adminId: string) {
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

  async listAdmins() {
    const admins = await User.find({ role: 'admin', isDeleted: { $ne: true } })
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .sort({ createdAt: -1 });
    return { admins };
  }

  async resetUserPassword(
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

  private generateAccessToken(user: IUser) {
    return generateToken(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
      config.JWT_SECRET,
    );
  }

  private generateRefreshToken(_user: IUser) {
    return crypto.randomBytes(40).toString('hex');
  }

  private async publishUserCreatedEvent(user: IUser) {
    try {
      const channelWrapper = this.rabbitMQ.createChannel({
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
}

export const authService = new AuthService();
