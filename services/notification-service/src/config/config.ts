import { createConfig, NotificationEnv } from '@vortex/common';

export const config = createConfig(NotificationEnv);

export function getSmtpConfig() {
  return {
    host: config.get(NotificationEnv.SMTP_HOST),
    port: parseInt(config.get(NotificationEnv.SMTP_PORT) ?? '587', 10),
    user: config.get(NotificationEnv.SMTP_USER),
    pass: config.get(NotificationEnv.SMTP_PASS),
    fromEmail: config.FROM_EMAIL,
  };
}
