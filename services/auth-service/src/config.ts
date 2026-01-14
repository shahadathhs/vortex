import { createConfig, AuthEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

export const config = createConfig(AuthEnv, {
  PORT: ServicePort.AUTH,
  RABBITMQ_URL: 'amqp://127.0.0.1',
});
