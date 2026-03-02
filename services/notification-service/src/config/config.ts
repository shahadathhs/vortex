import { load } from '@systemix/env';

const schema = {
  PORT: { type: 'number' as const, default: 3004 },
  RABBITMQ_URL: { type: 'string' as const, default: 'amqp://127.0.0.1:5672' },
  SMTP_HOST: { type: 'string' as const, default: '' },
  SMTP_PORT: { type: 'string' as const, default: '587' },
  SMTP_USER: { type: 'string' as const, default: '' },
  SMTP_PASS: { type: 'string' as const, default: '', secret: true },
  FROM_EMAIL: { type: 'string' as const, default: 'noreply@vortex.local' },
};

export const env = load(schema, { fromFile: ['.env', '.env.local'] });

export function getSmtpConfig() {
  return {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT ?? '587', 10),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    fromEmail: env.FROM_EMAIL,
  };
}
