import { createConfig, ProductEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

export const config = createConfig(ProductEnv, {
  PORT: ServicePort.PRODUCT,
  RABBITMQ_URL: 'amqp://127.0.0.1',
});
