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

export class NotificationService {
  startConsumer() {
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
              this.handleMessage(msg.content.toString());
              channel.ack(msg);
            }
          },
        );
      },
    });

    logger.info('Notification consumer started');
  }

  private handleMessage(content: string) {
    try {
      const payload: NotificationPayload = JSON.parse(content);
      const event = String(payload.event ?? 'unknown');

      if (event === 'order.created') {
        this.handleOrderCreated(payload.data ?? {});
      } else if (event === 'order.updated') {
        this.handleOrderUpdated(payload.data ?? {});
      } else if (event === 'user.created') {
        this.handleUserCreated(payload.data ?? {});
      } else if (
        event === 'product.created' ||
        event === 'product.updated' ||
        event === 'product.deleted'
      ) {
        this.handleProductEvent(event, payload.data ?? {});
      } else {
        logger.info('Received event:', event, payload.data);
      }
    } catch (error) {
      logger.error('Failed to handle notification:', error);
    }
  }

  private safeStr(v: unknown): string {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  }

  private handleOrderCreated(data: Record<string, unknown>) {
    const orderId = this.safeStr(data.orderId);
    const userId = this.safeStr(data.userId);
    const totalPrice = this.safeStr(data.totalPrice);
    logger.info(
      `📧 [Order Confirmation] Order ${orderId} placed by user ${userId}. Total: $${totalPrice}`,
    );
    // TODO: Send email via provider (SendGrid, AWS SES, etc.)
  }

  private handleOrderUpdated(data: Record<string, unknown>) {
    const orderId = this.safeStr(data.orderId);
    const userId = this.safeStr(data.userId);
    const status = this.safeStr(data.status);
    logger.info(
      `📧 [Order Update] Order ${orderId} (user ${userId}) status: ${status}`,
    );
    // TODO: Send shipping/delivery notification when status is shipped/delivered
  }

  private handleUserCreated(data: Record<string, unknown>) {
    const email = this.safeStr(data.email);
    const firstName = this.safeStr(data.firstName);
    logger.info(`📧 [Welcome Email] Sending to ${email} (${firstName})`);
    // TODO: Send welcome email via provider
  }

  private handleProductEvent(event: string, data: Record<string, unknown>) {
    const productId = this.safeStr(data.productId);
    const name = this.safeStr(data.name);
    logger.info(`📧 [Product ${event}] ${name} (${productId})`);
    // TODO: Notify admins/vendors of catalog changes
  }
}

export const notificationService = new NotificationService();
