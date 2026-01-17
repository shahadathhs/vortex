import { RabbitMQManager } from '@vortex/common';
import mongoose from 'mongoose';

import app from './app';
import { config } from './config';

const start = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.info('Order DB connected');

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(config.PORT, () => {
      console.info(`Order Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Order Service', error);
  }
};

start();
