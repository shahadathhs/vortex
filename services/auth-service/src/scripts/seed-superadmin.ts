/**
 * Seeds a system user. Runs on auth-service startup when SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are set.
 * Can also run standalone: pnpm auth:seed
 */
import { logger } from '@vortex/common';

import { config } from '../config/config';
import { User } from '../models/User';

export async function seedSystemUser(): Promise<void> {
  const email = config.SUPERADMIN_EMAIL.trim();
  const password = config.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    logger.info(
      'Skipping system user seed: SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set',
    );
    return;
  }

  if (password.length < 8) {
    logger.warn(
      'Skipping system user seed: SUPERADMIN_PASSWORD must be at least 8 characters',
    );
    return;
  }

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { role: 'system' }],
  });

  if (existing) {
    if (existing.role === 'system') {
      logger.info(`System user already exists: ${existing.email}`);
    } else {
      logger.warn(
        `User ${email} exists with role ${existing.role}. Cannot seed system user.`,
      );
    }
    return;
  }

  const [firstName, ...lastParts] = email.split('@')[0].split(/[._-]/);
  const lastName = lastParts.join(' ') || 'Admin';

  const systemUser = await User.create({
    email: email.toLowerCase(),
    password,
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
    role: 'system',
  });

  logger.info(`System user created: ${systemUser.email}`);
}

/** @deprecated Use seedSystemUser */
export const seedSuperadmin = seedSystemUser;

/**
 * Standalone entry point for pnpm auth:seed
 */
async function runStandalone() {
  const mongoose = await import('mongoose');
  const mongoUri = config.MONGODB_URI;
  const email = config.SUPERADMIN_EMAIL?.trim();
  const password = config.SUPERADMIN_PASSWORD;

  if (!mongoUri || !email || !password) {
    console.error(
      'MONGODB_URI, SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('SUPERADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  try {
    await mongoose.default.connect(mongoUri);
    await seedSystemUser();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.default.disconnect();
  }
}

// Run standalone when executed directly (pnpm auth:seed)
const isStandalone = process.argv[1]?.includes('seed-superadmin') ?? false;
if (isStandalone) {
  runStandalone();
}
