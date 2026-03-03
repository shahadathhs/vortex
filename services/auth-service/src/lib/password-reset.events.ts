import type { ConfirmChannel } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  logger,
  RabbitMQManager,
} from '@vortex/common';

export async function publishPasswordResetRequested(
  rabbitUrl: string,
  data: { email: string; resetToken: string; resetUrl: string },
) {
  try {
    const rabbitMQ = RabbitMQManager.getConnection(rabbitUrl);
    const channelWrapper = rabbitMQ.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, {
          durable: true,
        });
      },
    });
    await channelWrapper.publish(EXCHANGE, EventName.PASSWORD_RESET_REQUESTED, {
      event: EventName.PASSWORD_RESET_REQUESTED,
      timestamp: new Date(),
      data,
    });
    logger.info(`📤 Published ${EventName.PASSWORD_RESET_REQUESTED}`);
  } catch (error) {
    logger.error(
      `Failed to publish ${EventName.PASSWORD_RESET_REQUESTED}:`,
      error,
    );
  }
}
