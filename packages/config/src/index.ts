import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * Auto-generates a config object from an enum.
 * Each enum key becomes a config property that reads from process.env.
 */
export function createConfig<T extends Record<string, string>>(
  configEnum: T,
  defaults: Partial<Record<keyof T, string | number>> = {},
): Record<keyof T, string | number> {
  const config: any = {};

  for (const key in configEnum) {
    const envKey = configEnum[key];
    config[key] = process.env[envKey] || defaults[key] || '';
  }

  return config;
}

// Re-export all service-specific enums
export { GatewayEnv } from './enums/gateway';
export { AuthEnv } from './enums/auth';
export { ProductEnv } from './enums/product';
export { OrderEnv } from './enums/order';
export { NotificationEnv } from './enums/notification';
