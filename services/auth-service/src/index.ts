import { RabbitMQManager } from '@vortex/common';

import app from './app';
import { config } from './config';
import { connectDB } from './config/db';

const start = async () => {
  try {
    await connectDB(config.MONGODB_URI);

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(config.PORT, () => {
      console.info(`Auth Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Auth Service', error);
  }
};

start().catch((error: unknown) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
