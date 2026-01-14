import { createConfig, ProductEnv } from '@vortex/config';
import { ServicePort } from '@vortex/config';

export const config = createConfig(ProductEnv, ServicePort.PRODUCT);
