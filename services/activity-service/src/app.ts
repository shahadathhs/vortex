import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import activityRoutes from './routes/activity.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiInfoLogger);

app.get('/', (req, res) => {
  res.json({
    service: 'activity-service',
    routes: { activities: '/api/activities', health: '/health' },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'activity-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/activities', activityRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
