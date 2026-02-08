import { logger, RabbitMQManager } from '@vortex/common';
import mongoose from 'mongoose';

import app from './app';
import { config } from './config';

const start = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Order DB connected');

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(config.PORT, () => {
      logger.info(`Order Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Order Service', error);
  }
};

start().catch((error: unknown) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});
