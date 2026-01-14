import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { RabbitMQManager, errorHandler, getConfig } from '@vortex/common';

const config = getConfig();
const app = express();
const PORT = config.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'product-service', status: 'healthy', timestamp: new Date() });
});

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.info('Product DB connected');

    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(PORT, () => {
      console.info(`Product Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Product Service', error);
  }
};

start();
