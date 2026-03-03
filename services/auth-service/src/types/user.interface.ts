import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'system' | 'seller' | 'buyer';
  isEmailVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  updatePassword(newPassword: string): Promise<void>;
  toProfileJSON(): Record<string, unknown>;
  isAdmin(): boolean;
}
