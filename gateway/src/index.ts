import app from './app';
import { config } from './config';

app.listen(config.PORT, () => {
  console.info(`API Gateway listening on port ${config.PORT}`);
});
