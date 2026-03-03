import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3007,
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3003',
  PRODUCT_SERVICE_URL:
    process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',
  INTERNAL_SECRET: process.env.INTERNAL_SECRET ?? '',
};
