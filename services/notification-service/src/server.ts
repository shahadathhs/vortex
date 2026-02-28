import { logger } from '@vortex/common';

import app from './app';
import { config } from './config/config';
import { notificationService } from './services/notification.service';

process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', reason);
  process.exit(1);
});

const start = () => {
  try {
    notificationService.startConsumer();

    const server = app.listen(config.PORT, () => {
      logger.info(`Notification Service listening on port ${config.PORT}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error('Failed to start Notification Service', error);
    process.exit(1);
  }
};

start();
