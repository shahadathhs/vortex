import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export enum NotificationEnv {
  PORT = 'PORT',
  RABBITMQ_URL = 'RABBITMQ_URL',
}

export const config = {
  PORT: process.env[NotificationEnv.PORT] || 3004,
  RABBITMQ_URL: process.env[NotificationEnv.RABBITMQ_URL] || 'amqp://127.0.0.1',
};
