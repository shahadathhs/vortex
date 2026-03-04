import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3006,
  MONGODB_URI:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vortex_activity',
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://127.0.0.1:5672',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
};
