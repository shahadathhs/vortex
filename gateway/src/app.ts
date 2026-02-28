import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import proxyRouter from './proxy/proxy';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(apiInfoLogger);

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', status: 'healthy', timestamp: new Date() });
});

app.use(proxyRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
