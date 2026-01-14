import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export enum AuthEnv {
  MONGODB_URI = 'MONGODB_URI',
  JWT_SECRET = 'JWT_SECRET',
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export const config = {
  MONGODB_URI: process.env[AuthEnv.MONGODB_URI] as string,
  JWT_SECRET: process.env[AuthEnv.JWT_SECRET] as string,
  PORT: process.env[AuthEnv.PORT] || 3001,
  RABBITMQ_URL: process.env[AuthEnv.RABBITMQ_URL] || 'amqp://127.0.0.1',
};
