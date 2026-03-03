import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';

import { IUser } from '../types/user.interface';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ['system', 'seller', 'buyer'],
      default: 'buyer',
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

// Index for performance
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1, isActive: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password as string);
};

userSchema.methods.updatePassword = async function (newPassword: string) {
  this.password = newPassword;
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  this.refreshToken = undefined;
  await this.save();
};

userSchema.methods.toProfileJSON = function () {
  return {
    id: String(this._id),
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.methods.isSystem = function () {
  return this.role === 'system';
};

export const User = model<IUser>('User', userSchema);
