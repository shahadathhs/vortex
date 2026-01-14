import app from './app';
import { validateConfig } from '@vortex/common';
import { ServicePort } from '@vortex/constants';

const config = validateConfig({}, ServicePort.GATEWAY);
const PORT = config.PORT;

app.listen(PORT, () => {
  console.info(`API Gateway listening on port ${PORT}`);
});
