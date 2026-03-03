import type { Channel } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  logger,
  QueueName,
  RabbitMQManager,
  RoutingKey,
} from '@vortex/common';

import { config } from '../config/config';
import { Activity } from '../models/Activity';

interface ActivityPayload {
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: string | Date;
}

async function handleMessage(content: string) {
  try {
    const payload: ActivityPayload = JSON.parse(content);
    const timestamp =
      typeof payload.timestamp === 'string'
        ? new Date(payload.timestamp)
        : (payload.timestamp ?? new Date());

    await Activity.create({
      actorId: payload.actorId,
      actorRole: payload.actorRole,
      actorEmail: payload.actorEmail,
      action: payload.action,
      resource: payload.resource,
      resourceId: payload.resourceId,
      metadata: payload.metadata,
      ip: payload.ip,
      userAgent: payload.userAgent,
      timestamp,
    });

    logger.debug(`Activity stored: ${payload.action} on ${payload.resource}`);
  } catch (error) {
    logger.error('Failed to store activity:', error);
    throw error;
  }
}

export function startConsumer() {
  const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  connection.createChannel({
    setup: async (channel: Channel) => {
      await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      await channel.assertQueue(QueueName.ACTIVITY_QUEUE, {
        durable: true,
      });
      await channel.bindQueue(
        QueueName.ACTIVITY_QUEUE,
        EXCHANGE,
        RoutingKey.ALL_ACTIVITY_EVENTS,
      );
      await channel.consume(QueueName.ACTIVITY_QUEUE, (msg) => {
        if (msg) {
          void handleMessage(msg.content.toString()).finally(() => {
            channel.ack(msg);
          });
        }
      });
    },
  });

  logger.info('Activity consumer started');
}
