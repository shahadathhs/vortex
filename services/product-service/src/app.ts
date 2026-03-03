import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import productRoutes from './routes/product.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiInfoLogger);

app.get('/', (req, res) => {
  res.json({
    service: 'product-service',
    routes: { products: '/api/products', health: '/health' },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'product-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
