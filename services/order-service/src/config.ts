import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export enum OrderEnv {
  MONGODB_URI = 'MONGODB_URI',
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export const config = {
  MONGODB_URI: process.env[OrderEnv.MONGODB_URI] as string,
  PORT: process.env[OrderEnv.PORT] || 3003,
  RABBITMQ_URL: process.env[OrderEnv.RABBITMQ_URL] || 'amqp://127.0.0.1',
};
