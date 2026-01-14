import app from './app';
import { createConfig, GatewayEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

const config = createConfig(GatewayEnv, ServicePort.GATEWAY);
const PORT = config.PORT;

app.listen(PORT, () => {
  console.info(`API Gateway listening on port ${PORT}`);
});
