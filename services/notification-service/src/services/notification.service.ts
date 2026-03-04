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
import { handleTfaOtpRequested } from '../handlers/tfa.handlers';
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
      case EventName.TFA_OTP_REQUESTED:
        await handleTfaOtpRequested(data);
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
      case EventName.PRODUCT_LOW_STOCK:
      case EventName.PRODUCT_OUT_OF_STOCK: {
        const productId =
          typeof data.productId === 'string' ? data.productId : '';
        const name = typeof data.name === 'string' ? data.name : '';
        const stock = typeof data.stock === 'number' ? data.stock : 0;
        const sellerId =
          typeof data.sellerId === 'string' ? data.sellerId : null;
        const message =
          event === EventName.PRODUCT_OUT_OF_STOCK
            ? `${name} is out of stock`
            : `${name} is low on stock (${stock} left)`;
        const payload = { productId, name, stock, sellerId, message };
        const { storeNotification } = await import('../lib/store-notification');
        const { deliverSocketRealtime } =
          await import('../lib/deliver-realtime');
        if (sellerId) {
          await storeNotification(event, payload, {
            recipientId: sellerId,
            recipientRole: 'seller',
          });
          await deliverSocketRealtime(sellerId, event, payload);
        }
        await storeNotification(event, payload, { recipientRole: 'system' });
        logger.info(`[${event}] ${name} (${productId}) stock: ${stock}`);
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
