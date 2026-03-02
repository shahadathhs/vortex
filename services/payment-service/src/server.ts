import { logger } from '@vortex/common';

import app from './app';
import { env } from './config/config';

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
    const server = app.listen(env.PORT, () => {
      logger.info(`Payment Service listening on port ${env.PORT}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error('Failed to start Payment Service', error);
    process.exit(1);
  }
};

start();
