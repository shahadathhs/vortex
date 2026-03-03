import type { ConfirmChannel } from 'amqplib';

import { EXCHANGE, EXCHANGE_TYPE, EventName } from '../constants';
import { logger } from '../utils/logger';
import { RabbitMQManager } from '../core/rabbit-mq-manager';

export interface ActivityPayload {
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export async function publishActivity(
  rabbitUrl: string,
  payload: Omit<ActivityPayload, 'timestamp'>,
): Promise<void> {
  try {
    const connection = RabbitMQManager.getConnection(rabbitUrl);
    const channelWrapper = connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, {
          durable: true,
        });
      },
    });

    const fullPayload: ActivityPayload = {
      ...payload,
      timestamp: new Date(),
    };

    await channelWrapper.publish(
      EXCHANGE,
      EventName.ACTIVITY_LOGGED,
      fullPayload,
    );

    logger.debug(`Activity logged: ${payload.action} on ${payload.resource}`);
  } catch (error) {
    logger.error('Failed to publish activity:', error);
  }
}
