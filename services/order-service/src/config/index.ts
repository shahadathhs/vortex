import { createConfig, OrderEnv } from '@vortex/config';
import { ServicePort } from '@vortex/config';

export const config = createConfig(OrderEnv, ServicePort.ORDER);
