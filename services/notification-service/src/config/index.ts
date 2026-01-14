import { createConfig, NotificationEnv } from '@vortex/config';
import { ServicePort } from '@vortex/config';

export const config = createConfig(NotificationEnv, ServicePort.NOTIFICATION);
