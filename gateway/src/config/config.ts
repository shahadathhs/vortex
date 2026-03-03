import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3000,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
  PRODUCT_SERVICE_URL:
    process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002',
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3003',
  NOTIFICATION_SERVICE_URL:
    process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3004',
  PAYMENT_SERVICE_URL:
    process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3005',
  ACTIVITY_SERVICE_URL:
    process.env.ACTIVITY_SERVICE_URL ?? 'http://localhost:3006',
  ANALYTICS_SERVICE_URL:
    process.env.ANALYTICS_SERVICE_URL ?? 'http://localhost:3007',
};
