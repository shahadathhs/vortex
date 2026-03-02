import { ConfirmChannel, logger, RabbitMQManager } from '@vortex/common';

export async function publishPasswordResetRequested(
  rabbitUrl: string,
  data: { email: string; resetToken: string; resetUrl: string },
) {
  try {
    const rabbitMQ = RabbitMQManager.getConnection(rabbitUrl);
    const channelWrapper = rabbitMQ.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange('vortex', 'topic', { durable: true });
      },
    });
    await channelWrapper.publish('vortex', 'password.reset.requested', {
      event: 'password.reset.requested',
      timestamp: new Date(),
      data,
    });
    logger.info('Published password.reset.requested');
  } catch (error) {
    logger.error('Failed to publish password.reset.requested:', error);
  }
}
