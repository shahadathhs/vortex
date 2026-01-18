import crypto from 'crypto';

import { AppError, generateToken, RabbitMQManager } from '@vortex/common';

import { config } from '../config';
import { User } from '../models/User';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { IUser } from '../types/user.interface';

export class AuthService {
  private rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  async register(data: RegisterInput) {
    const { email, password, firstName, lastName } = data;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const user = await User.create({ 
      email, 
      password, 
      firstName, 
      lastName,
      role: 'customer' 
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
        id: user._id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    };
  }

  async login(data: LoginInput) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { 
      token, 
      refreshToken,
      user: { 
        id: user._id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      } 
    };
  }

  async refreshToken(oldRefreshToken: string) {
    const user = await User.findOne({ refreshToken: oldRefreshToken });
    
    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { token, refreshToken };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, password reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // TODO: Send email with resetToken
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If email exists, password reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return { user };
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(user: IUser) {
    return generateToken(
      { 
        id: user._id.toString(), 
        email: user.email,
        role: user.role 
      },
      config.JWT_SECRET,
    );
  }

  private generateRefreshToken(user: IUser) {
    return crypto.randomBytes(40).toString('hex');
  }

  private async publishUserCreatedEvent(user: IUser) {
    try {
      const channelWrapper = this.rabbitMQ.createChannel({
        json: true,
        setup: async (channel: import('amqplib').ConfirmChannel) => {
          await channel.assertExchange('vortex', 'topic', { durable: true });
        },
      });

      await channelWrapper.publish('vortex', 'user.created', {
        eventName: 'user.created',
        timestamp: new Date(),
        data: {
          userId: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      console.log('📤 Published user.created event');
    } catch (error) {
      console.error('Failed to publish user.created event:', error);
    }
  }
}

export const authService = new AuthService();
