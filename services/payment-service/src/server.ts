import { logger } from '@vortex/common';
import mongoose from 'mongoose';

import app from './app';
import { config } from './config/config';
import { connectDB } from './config/db';
import { startPayoutCron } from './jobs/payout-cron';

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

    void startPayoutCron();

    const server = app.listen(config.PORT, () => {
      logger.info(`Payment Service listening on port ${config.PORT}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        void mongoose.connection.close().then(() => process.exit(0));
      });
    });
  } catch (error) {
    logger.error('Failed to start Payment Service', error);
    process.exit(1);
  }
};

start().catch((error: unknown) => {
  logger.error('Fatal error during startup', error);
  process.exit(1);
});
