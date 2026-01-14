import { User } from '../models/User';
import { generateToken, AppError } from '@vortex/common';
import { config } from '../config';

export class AuthService {
  async register(data: any) {
    const { email, password } = data;
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    const user = await User.create({ email, password });
    return {
      message: 'User registered successfully',
      user: { id: user._id, email: user.email },
    };
  }

  async login(data: any) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user || !(await (user as any).comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(
      { id: (user._id as any).toString(), email: user.email },
      config.JWT_SECRET,
    );
    return { token, user: { id: user._id, email: user.email } };
  }
}

export const authService = new AuthService();
