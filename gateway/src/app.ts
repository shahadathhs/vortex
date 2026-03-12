import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { apiRateLimiter } from './middleware/rate-limit';
import proxyRouter from './proxy';

const app: express.Application = express();

// Trust the immediate upstream proxy (Next.js rewrite / nginx / load balancer).
// Required so express-rate-limit can read X-Forwarded-For correctly.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(apiRateLimiter);
app.use(apiInfoLogger);

app.get('/', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({
    name: 'Vortex API Gateway',
    gateway: {
      health: `${base}/health`,
    },
    services: [
      {
        name: 'auth-service',
        api: `${base}/api/auth`,
        health: `${base}/api/auth/health`,
      },
      {
        name: 'product-service',
        api: `${base}/api/products`,
        health: `${base}/api/products/health`,
      },
      {
        name: 'order-service',
        api: `${base}/api/orders`,
        health: `${base}/api/orders/health`,
      },
      {
        name: 'cart (order-service)',
        api: `${base}/api/cart`,
        health: `${base}/api/cart/health`,
      },
      {
        name: 'payment-service',
        api: `${base}/api/checkout`,
        health: `${base}/api/checkout/health`,
      },
      {
        name: 'notification-service',
        note: 'internal event consumer — no public API',
      },
      {
        name: 'activity-service',
        api: `${base}/api/activities`,
        health: `${base}/api/activities/health`,
      },
    ],
  });
});

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', status: 'healthy', timestamp: new Date() });
});

app.use(proxyRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
