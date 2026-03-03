import { logger } from '@vortex/common';

import app from './app';
import { config } from './config/config';
import { connectDB } from './config/db';
import { startConsumer } from './services/activity.service';

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
    await connectDB(config.MONGODB_URI);
    startConsumer();

    const server = app.listen(config.PORT, () => {
      logger.info(`Activity Service listening on port ${config.PORT}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error('Failed to start Activity Service', error);
    process.exit(1);
  }
};

void start();
