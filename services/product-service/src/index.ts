import { RabbitMQManager } from '@vortex/common';
import mongoose from 'mongoose';

import app from './app';
import { config } from './config';

const start = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.info('Product DB connected');

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(config.PORT, () => {
      console.info(`Product Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Product Service', error);
  }
};

start().catch((error: unknown) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
