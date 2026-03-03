import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import checkoutRoutes from './routes/checkout.routes';
import webhookRoutes from './routes/webhook.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    service: 'payment-service',
    routes: {
      checkout: '/api/checkout',
      webhooks: '/api/webhooks/stripe',
      health: '/health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'payment-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/checkout', express.json(), apiInfoLogger, checkoutRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
