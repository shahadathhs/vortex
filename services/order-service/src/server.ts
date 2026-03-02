import { logger, RabbitMQManager } from '@vortex/common';
import mongoose from 'mongoose';

import app from './app';
import { env, mongoUri } from './config/config';

process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', reason);
  process.exit(1);
});

const start = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('Order DB connected');

    RabbitMQManager.getConnection(env.RABBITMQ_URL);

    const server = app.listen(env.PORT, () => {
      logger.info(`Order Service listening on port ${env.PORT}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error('Failed to start Order Service', error);
    process.exit(1);
  }
};

start().catch((error: unknown) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});
