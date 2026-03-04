import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import analyticsRoutes from './routes/analytics.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiInfoLogger);

app.get('/', (req, res) => {
  res.json({
    service: 'analytics-service',
    routes: { dashboard: '/api/analytics/dashboard', health: '/health' },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'analytics-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
