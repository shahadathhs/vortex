import { validateConfig, z } from '@vortex/common';
import { ServicePort } from '@vortex/constants';

export const config = validateConfig(
  {
    MONGODB_URI: z.string(),
  },
  ServicePort.PRODUCT,
);
