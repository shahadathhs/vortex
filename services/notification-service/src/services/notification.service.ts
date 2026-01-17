import { RabbitMQManager } from '@vortex/common';
import { QueueName } from '@vortex/config';

import { config } from '../config';

export class NotificationService {
  async startConsumer() {
    const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

    // Create a channel for consuming events
    connection.createChannel({
      setup: (channel: any) => {
        return Promise.all([
          channel.assertQueue(QueueName.NOTIFICATION_QUEUE, { durable: true }),
          channel.consume(QueueName.NOTIFICATION_QUEUE, (msg: any) => {
            if (msg) {
              this.handleMessage(msg.content.toString());
              channel.ack(msg);
            }
          }),
        ]);
      },
    });
  }

  private handleMessage(content: string) {
    console.info('Received event:', content);
    // Add logic to parse event and send email/notification
  }
}

export const notificationService = new NotificationService();
