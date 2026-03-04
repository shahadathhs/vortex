import { logger, RabbitMQManager } from '@vortex/common';

import app from './app';
import { config } from './config/config';
import { connectDB } from './config/db';
import { seedSystemUser } from './scripts/seed-superadmin';

// Process-level error handlers
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

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    // Seed system user
    await seedSystemUser();

    const server = app.listen(config.PORT, () => {
      logger.info(`Auth Service listening on port ${config.PORT}`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start Auth Service', error);
    process.exit(1);
  }
};

start().catch((error: unknown) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});
