import { load } from '@systemix/env';

const schema = {
  PORT: { type: 'number' as const, default: 3005 },
  STRIPE_SECRET_KEY: { type: 'string' as const, default: '', secret: true },
  STRIPE_WEBHOOK_SECRET: { type: 'string' as const, default: '', secret: true },
  ORDER_SERVICE_URL: {
    type: 'string' as const,
    default: 'http://localhost:3003',
  },
  PRODUCT_SERVICE_URL: {
    type: 'string' as const,
    default: 'http://localhost:3002',
  },
  JWT_SECRET: { type: 'string' as const, required: true, secret: true },
  INTERNAL_SECRET: { type: 'string' as const, required: true, secret: true },
};

export const env = load(schema, { fromFile: ['.env', '.env.local'] });

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required for payment service`);
  }
  return value;
}

export const jwtSecret = requireEnv('JWT_SECRET', env.JWT_SECRET);
export const internalSecret = requireEnv(
  'INTERNAL_SECRET',
  env.INTERNAL_SECRET,
);
