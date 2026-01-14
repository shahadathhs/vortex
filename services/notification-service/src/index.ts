import app from './app';
import { config } from './config';
import { notificationService } from './services/notification.service';

const start = async () => {
  try {
    // Start RabbitMQ Consumer
    await notificationService.startConsumer();

    app.listen(config.PORT, () => {
      console.info(`Notification Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Notification Service', error);
  }
};

start();
