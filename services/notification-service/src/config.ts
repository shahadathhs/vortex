import { createConfig, NotificationEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

export const config = createConfig(NotificationEnv, {
  PORT: ServicePort.NOTIFICATION,
  RABBITMQ_URL: 'amqp://127.0.0.1',
});
