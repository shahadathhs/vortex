import app from './app';
import { config } from './config/config';
import { notificationService } from './services/notification.service';

const start = () => {
  try {
    // Start RabbitMQ Consumer
    notificationService.startConsumer();

    app.listen(config.PORT, () => {
      console.info(`Notification Service listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Notification Service', error);
  }
};

start();
