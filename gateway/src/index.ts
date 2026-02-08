import { logger } from '@vortex/common';

import app from './app';
import { config } from './config';

app.listen(config.PORT, () => {
  logger.info(`API Gateway listening on port ${config.PORT}`);
});
