import app from './app';
import { config } from './config';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.info(`API Gateway listening on port ${PORT}`);
});
