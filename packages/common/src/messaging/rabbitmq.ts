import amqp, { AmqpConnectionManager } from 'amqp-connection-manager';

import { logger } from '../utils';

export class RabbitMQManager {
  private static instance: AmqpConnectionManager;

  public static getConnection(url: string): AmqpConnectionManager {
    if (!this.instance) {
      this.instance = amqp.connect([url]);

      this.instance.on('connect', () => logger.info('Connected to RabbitMQ'));
      this.instance.on('disconnect', (err: unknown) => {
        const error = err as { err?: unknown };
        logger.error('RabbitMQ disconnected', error.err ?? err);
      });
    }
    return this.instance;
  }
}
