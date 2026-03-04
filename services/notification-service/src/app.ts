import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import notificationRoutes from './routes/notification.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiInfoLogger);

app.get('/', (req, res) => {
  res.json({
    service: 'notification-service',
    routes: {
      notifications: '/api/notifications',
      settings: '/api/notifications/settings',
      health: '/health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'notification-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
