import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3005,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  STRIPE_CONNECT_WEBHOOK_SECRET:
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET ?? '',
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3003',
  PRODUCT_SERVICE_URL:
    process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
  MONGODB_URI:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vortex-payments',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  INTERNAL_SECRET: process.env.INTERNAL_SECRET ?? '',
  APP_URL: process.env.APP_URL ?? 'http://localhost:3000',
};
