import {
  Channel,
  ConsumeMessage,
  logger,
  QueueName,
  RabbitMQManager,
} from '@vortex/common';

import { config } from '../config/config';

interface NotificationPayload {
  event?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

function handleOrderCreated(data: Record<string, unknown>) {
  const orderId = safeStr(data.orderId);
  const userId = safeStr(data.userId);
  const totalPrice = safeStr(data.totalPrice);
  logger.info(
    `📧 [Order Confirmation] Order ${orderId} placed by user ${userId}. Total: $${totalPrice}`,
  );
  // TODO: Send email via provider (SendGrid, AWS SES, etc.)
}

function handleOrderUpdated(data: Record<string, unknown>) {
  const orderId = safeStr(data.orderId);
  const userId = safeStr(data.userId);
  const status = safeStr(data.status);
  logger.info(
    `📧 [Order Update] Order ${orderId} (user ${userId}) status: ${status}`,
  );
  // TODO: Send shipping/delivery notification when status is shipped/delivered
}

function handleUserCreated(data: Record<string, unknown>) {
  const email = safeStr(data.email);
  const firstName = safeStr(data.firstName);
  logger.info(`📧 [Welcome Email] Sending to ${email} (${firstName})`);
  // TODO: Send welcome email via provider
}

function handleProductEvent(event: string, data: Record<string, unknown>) {
  const productId = safeStr(data.productId);
  const name = safeStr(data.name);
  logger.info(`📧 [Product ${event}] ${name} (${productId})`);
  // TODO: Notify admins/vendors of catalog changes
}

function handleMessage(content: string) {
  try {
    const payload: NotificationPayload = JSON.parse(content);
    const event = String(payload.event ?? 'unknown');

    if (event === 'order.created') {
      handleOrderCreated(payload.data ?? {});
    } else if (event === 'order.updated') {
      handleOrderUpdated(payload.data ?? {});
    } else if (event === 'user.created') {
      handleUserCreated(payload.data ?? {});
    } else if (
      event === 'product.created' ||
      event === 'product.updated' ||
      event === 'product.deleted'
    ) {
      handleProductEvent(event, payload.data ?? {});
    } else {
      logger.info('Received event:', event, payload.data);
    }
  } catch (error) {
    logger.error('Failed to handle notification:', error);
  }
}

function startConsumer() {
  const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

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
            handleMessage(msg.content.toString());
            channel.ack(msg);
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
