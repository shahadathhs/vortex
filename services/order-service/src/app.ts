import { errorHandler } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import orderRoutes from './routes/order.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    service: 'order-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/orders', orderRoutes);

app.use(errorHandler);

export default app;
