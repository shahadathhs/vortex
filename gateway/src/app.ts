import { errorHandler } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import proxyRouter from './proxy';

const app: express.Application = express();

app.use(helmet());
app.use(cors());

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', status: 'healthy', timestamp: new Date() });
});

app.use(proxyRouter);

app.use(errorHandler);

export default app;
