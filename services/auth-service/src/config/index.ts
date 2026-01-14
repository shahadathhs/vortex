import { createConfig, AuthEnv } from '@vortex/config';
import { ServicePort } from '@vortex/config';

export const config = createConfig(AuthEnv, ServicePort.AUTH);
