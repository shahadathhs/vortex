import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import cartRoutes from './routes/cart.routes';
import internalRoutes from './routes/internal.routes';
import orderRoutes from './routes/order.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiInfoLogger);

app.get('/', (req, res) => {
  res.json({
    service: 'order-service',
    routes: { orders: '/api/orders', cart: '/api/cart', health: '/health' },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'order-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/internal', internalRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
