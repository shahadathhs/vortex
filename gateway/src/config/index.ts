import { createConfig, GatewayEnv } from '@vortex/config';
import { ServicePort } from '@vortex/config';

export const config = createConfig(GatewayEnv, ServicePort.GATEWAY);
