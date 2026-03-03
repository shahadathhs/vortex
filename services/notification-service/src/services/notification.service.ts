import type { Channel } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  logger,
  QueueName,
  RabbitMQManager,
  RoutingKey,
} from '@vortex/common';

import { config } from '../config/config';
import {
  handleOrderCreated,
  handleOrderUpdated,
} from '../handlers/order.handlers';
import { handlePasswordResetRequested } from '../handlers/password.handlers';
import { handleUserCreated } from '../handlers/user.handlers';

interface NotificationPayload {
  event: EventName;
  timestamp?: string;
  data?: Record<string, unknown>;
}

async function handleMessage(content: string) {
  const payload: NotificationPayload = JSON.parse(content);
  const event = payload.event;
  const data = payload.data ?? {};

  try {
    switch (event) {
      case EventName.ORDER_CREATED:
        await handleOrderCreated(data);
        break;
      case EventName.ORDER_UPDATED:
        await handleOrderUpdated(data);
        break;
      case EventName.USER_CREATED:
        await handleUserCreated(data);
        break;
      case EventName.PASSWORD_RESET_REQUESTED:
        await handlePasswordResetRequested(data);
        break;
      case EventName.PRODUCT_CREATED:
      case EventName.PRODUCT_UPDATED:
      case EventName.PRODUCT_DELETED: {
        const productId =
          typeof data.productId === 'string' ? data.productId : '';
        const name = typeof data.name === 'string' ? data.name : '';
        logger.info(`[Product ${event}] ${name} (${productId})`);
        break;
      }
      default:
        logger.info('Received unhandled event:', event, data);
    }
  } catch (error) {
    logger.error('Failed to handle notification:', error);
  }
}

function startConsumer() {
  const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  connection.createChannel({
    setup: async (channel: Channel) => {
      await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      await channel.assertQueue(QueueName.NOTIFICATION_QUEUE, {
        durable: true,
      });
      await channel.bindQueue(
        QueueName.NOTIFICATION_QUEUE,
        EXCHANGE,
        RoutingKey.ALL_EVENTS,
      );
      await channel.consume(QueueName.NOTIFICATION_QUEUE, (msg) => {
        if (msg) {
          void handleMessage(msg.content.toString()).finally(() => {
            channel.ack(msg);
          });
        }
      });
    },
  });

  logger.info('Notification consumer started');
}

export const notificationService = {
  startConsumer,
};
