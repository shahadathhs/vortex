import { QueueName, RabbitMQManager } from '@vortex/common';
import { Channel, ConsumeMessage } from 'amqplib';

import { config } from '../config/config';

export class NotificationService {
  startConsumer() {
    const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

    // Create a channel for consuming events
    connection.createChannel({
      setup: (channel: Channel) => {
        return Promise.all([
          channel.assertQueue(QueueName.NOTIFICATION_QUEUE, { durable: true }),
          channel.consume(
            QueueName.NOTIFICATION_QUEUE,
            (msg: ConsumeMessage | null) => {
              if (msg) {
                this.handleMessage(msg.content.toString());
                channel.ack(msg);
              }
            },
          ),
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
