import { logger, RabbitMQManager } from '@vortex/common';

import app from './app';
import { config } from './config/config';
import { connectDB } from './config/db';
import { seedSuperadmin } from './scripts/seed-superadmin';

const start = async () => {
  try {
    await connectDB(config.MONGODB_URI);

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    // Seed superadmin
    await seedSuperadmin();

    app.listen(config.PORT, () => {
      logger.info(`Auth Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Auth Service', error);
  }
};

start().catch((error: unknown) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
});
