import { createConfig, OrderEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

export const config = createConfig(OrderEnv, {
  PORT: ServicePort.ORDER,
  RABBITMQ_URL: 'amqp://127.0.0.1',
});
