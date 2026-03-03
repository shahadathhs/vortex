import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const config = {
  PORT: Number(process.env.PORT) || 3004,
  RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://127.0.0.1:5672',
  SMTP_HOST: process.env.SMTP_HOST ?? '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
  FROM_EMAIL: process.env.FROM_EMAIL ?? 'noreply@vortex.local',
};

export function getSmtpConfig() {
  return {
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
    fromEmail: config.FROM_EMAIL,
  };
}
