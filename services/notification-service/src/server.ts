import { logger } from '@vortex/common';

import app from './app';
import { env, getSmtpConfig } from './config/config';
import { initEmailTransport } from './lib/email';
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
    const smtp = getSmtpConfig();
    initEmailTransport(
      smtp.host,
      smtp.port,
      smtp.user,
      smtp.pass,
      smtp.fromEmail,
    );
    notificationService.startConsumer();

    const server = app.listen(env.PORT, () => {
      logger.info(`Notification Service listening on port ${env.PORT}`);
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
