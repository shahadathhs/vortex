import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openApiSpec } from './docs/openapi';
import { apiRateLimiter } from './middleware/rate-limit';
import proxyRouter from './proxy';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(apiRateLimiter);
app.use(apiInfoLogger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', status: 'healthy', timestamp: new Date() });
});

app.use(proxyRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
