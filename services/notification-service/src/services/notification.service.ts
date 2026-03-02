import {
  Channel,
  ConsumeMessage,
  logger,
  QueueName,
  RabbitMQManager,
} from '@vortex/common';

import {
  handleOrderCreated,
  handleOrderUpdated,
} from '../handlers/order.handlers';
import { handlePasswordResetRequested } from '../handlers/password.handlers';
import { handleUserCreated } from '../handlers/user.handlers';
import { env } from '../config/config';

interface NotificationPayload {
  event?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

async function handleMessage(content: string) {
  const payload: NotificationPayload = JSON.parse(content);
  const event = String(payload.event ?? 'unknown');
  const data = payload.data ?? {};

  try {
    if (event === 'order.created') {
      await handleOrderCreated(data);
    } else if (event === 'order.updated') {
      await handleOrderUpdated(data);
    } else if (event === 'user.created') {
      await handleUserCreated(data);
    } else if (event === 'password.reset.requested') {
      await handlePasswordResetRequested(data);
    } else if (
      event === 'product.created' ||
      event === 'product.updated' ||
      event === 'product.deleted'
    ) {
      const productId =
        typeof data.productId === 'string' ? data.productId : '';
      const name = typeof data.name === 'string' ? data.name : '';
      logger.info(`[Product ${event}] ${name} (${productId})`);
    } else {
      logger.info('Received event:', event, data);
    }
  } catch (error) {
    logger.error('Failed to handle notification:', error);
  }
}

function startConsumer() {
  const connection = RabbitMQManager.getConnection(env.RABBITMQ_URL);

  connection.createChannel({
    setup: async (channel: Channel) => {
      await channel.assertExchange('vortex', 'topic', { durable: true });
      await channel.assertQueue(QueueName.NOTIFICATION_QUEUE, {
        durable: true,
      });
      await channel.bindQueue(QueueName.NOTIFICATION_QUEUE, 'vortex', '#');
      await channel.consume(
        QueueName.NOTIFICATION_QUEUE,
        (msg: ConsumeMessage | null) => {
          if (msg) {
            void handleMessage(msg.content.toString()).finally(() =>
              channel.ack(msg),
            );
          }
        },
      );
    },
  });

  logger.info('Notification consumer started');
}

export const notificationService = {
  startConsumer,
};
