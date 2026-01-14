import { validateConfig } from '@vortex/common';
import { ServicePort } from '@vortex/constants';

export const config = validateConfig({}, ServicePort.NOTIFICATION);
