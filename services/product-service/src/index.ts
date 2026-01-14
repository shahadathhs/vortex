import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { RabbitMQManager, errorHandler } from '@vortex/common';
import { config } from './config';

import productRoutes from './routes/product.routes';

const app = express();
const PORT = config.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'product-service', status: 'healthy', timestamp: new Date() });
});

app.use('/api/products', productRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.info('Product DB connected');

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(PORT, () => {
      console.info(`Product Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Product Service', error);
  }
};

start();
