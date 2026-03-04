import type { ConfirmChannel } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  logger,
  RabbitMQManager,
} from '@vortex/common';

export async function publishTfaOtpRequested(
  rabbitUrl: string,
  data: { email: string; otp: string; purpose: 'enable' | 'login' },
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
    await channelWrapper.publish(EXCHANGE, EventName.TFA_OTP_REQUESTED, {
      event: EventName.TFA_OTP_REQUESTED,
      timestamp: new Date(),
      data,
    });
    logger.info(`📤 Published ${EventName.TFA_OTP_REQUESTED}`);
  } catch (error) {
    logger.error(`Failed to publish ${EventName.TFA_OTP_REQUESTED}:`, error);
  }
}
