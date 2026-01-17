import { errorHandler } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import productRoutes from './routes/product.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    service: 'product-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/products', productRoutes);

app.use(errorHandler);

export default app;
