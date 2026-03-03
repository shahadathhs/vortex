import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3002,
  MONGODB_URI:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/vortex-products',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://127.0.0.1:5672',
};
