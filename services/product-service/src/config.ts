import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export enum ProductEnv {
  MONGODB_URI = 'MONGODB_URI',
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export const config = {
  MONGODB_URI: process.env[ProductEnv.MONGODB_URI] as string,
  PORT: process.env[ProductEnv.PORT] || 3002,
  RABBITMQ_URL: process.env[ProductEnv.RABBITMQ_URL] || 'amqp://127.0.0.1',
};
