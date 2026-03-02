import { load } from '@systemix/env';

const schema = {
  JWT_SECRET: { type: 'string' as const, required: true, secret: true },
  MONGODB_URI: { type: 'string' as const, required: true, secret: true },
  PORT: { type: 'number' as const, default: 3003 },
  RABBITMQ_URL: { type: 'string' as const, default: 'amqp://127.0.0.1:5672' },
  INTERNAL_SECRET: { type: 'string' as const, required: true, secret: true },
};

export const env = load(schema, { fromFile: ['.env', '.env.local'] });

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required for order service`);
  }
  return value;
}

export const jwtSecret = requireEnv('JWT_SECRET', env.JWT_SECRET);
export const mongoUri = requireEnv('MONGODB_URI', env.MONGODB_URI);
export const internalSecret = requireEnv(
  'INTERNAL_SECRET',
  env.INTERNAL_SECRET,
);
