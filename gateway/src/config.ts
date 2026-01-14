import { createConfig, GatewayEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

export const config = createConfig(GatewayEnv, {
  PORT: ServicePort.GATEWAY,
});
