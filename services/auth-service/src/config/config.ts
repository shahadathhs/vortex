import { load } from '@systemix/env';

const schema = {
  MONGODB_URI: { type: 'string' as const, required: true, secret: true },
  JWT_SECRET: { type: 'string' as const, required: true, secret: true },
  PORT: { type: 'number' as const, default: 3001 },
  RABBITMQ_URL: { type: 'string' as const, default: 'amqp://127.0.0.1:5672' },
  SUPERADMIN_EMAIL: { type: 'string' as const, default: '' },
  SUPERADMIN_PASSWORD: { type: 'string' as const, default: '', secret: true },
  APP_URL: { type: 'string' as const, default: 'http://localhost:3000' },
};

export const env = load(schema, { fromFile: ['.env', '.env.local'] });

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required for auth service`);
  }
  return value;
}

export const jwtSecret = requireEnv('JWT_SECRET', env.JWT_SECRET);
export const mongoUri = requireEnv('MONGODB_URI', env.MONGODB_URI);
