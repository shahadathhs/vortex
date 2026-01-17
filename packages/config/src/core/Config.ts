import dotenv from 'dotenv';
import path from 'path';
import { ServicePort } from '../constants';

dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * Config class that auto-generates configuration from an enum.
 * Provides type-safe access to environment variables with proper defaults.
 */
export class Config<T extends Record<string, string>> {
  private config: Record<string, string>;
  private servicePort: number;

  constructor(configEnum: T, servicePort: ServicePort) {
    this.config = {};
    this.servicePort = servicePort;

    // Auto-populate config from enum
    for (const key in configEnum) {
      const envKey = configEnum[key];
      this.config[key] = process.env[envKey] || '';
    }
  }

  /**
   * Get a config value as string
   */
  get(key: keyof T): string {
    return this.config[key as string] || '';
  }

  /**
   * Get a config value or throw if missing
   */
  getOrThrow(key: keyof T): string {
    const value = this.config[key as string];
    if (!value) {
      throw new Error(
        `Environment variable ${String(key)} is required but missing`,
      );
    }
    return value;
  }

  /**
   * Get PORT with proper fallback to ServicePort
   */
  get PORT(): number {
    const envPort = this.config['PORT'];
    return envPort ? parseInt(envPort, 10) : this.servicePort;
  }

  /**
   * Get RABBITMQ_URL with default fallback
   */
  get RABBITMQ_URL(): string {
    return this.config['RABBITMQ_URL'] || 'amqp://127.0.0.1';
  }

  /**
   * Get MONGODB_URI (required for DB services)
   */
  get MONGODB_URI(): string {
    return this.getOrThrow('MONGODB_URI' as keyof T);
  }

  /**
   * Get JWT_SECRET (required for auth service)
   */
  get JWT_SECRET(): string {
    return this.getOrThrow('JWT_SECRET' as keyof T);
  }
}

/**
 * Factory function to create a Config instance
 */
export function createConfig<T extends Record<string, string>>(
  configEnum: T,
  servicePort: ServicePort,
): Config<T> {
  return new Config(configEnum, servicePort);
}
