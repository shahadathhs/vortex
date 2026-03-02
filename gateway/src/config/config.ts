import { load } from '@systemix/env';

const schema = {
  PORT: { type: 'number' as const, default: 3000 },
  AUTH_SERVICE_URL: { type: 'string' as const, required: true },
  PRODUCT_SERVICE_URL: { type: 'string' as const, required: true },
  ORDER_SERVICE_URL: { type: 'string' as const, required: true },
  NOTIFICATION_SERVICE_URL: { type: 'string' as const, required: true },
  PAYMENT_SERVICE_URL: { type: 'string' as const, required: true },
};

export const env = load(schema, { fromFile: ['.env', '.env.local'] });
