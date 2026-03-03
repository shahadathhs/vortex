import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3001,
  MONGODB_URI:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vortex-auth',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://127.0.0.1:5672',
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL ?? '',
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD ?? '',
  APP_URL: process.env.APP_URL ?? 'http://localhost:3000',
};
