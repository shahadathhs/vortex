import amqp, { AmqpConnectionManager } from 'amqp-connection-manager';

export class RabbitMQManager {
  private static instance: AmqpConnectionManager;

  public static getConnection(url: string): AmqpConnectionManager {
    if (!this.instance) {
      this.instance = amqp.connect([url]);

      this.instance.on('connect', () => console.info('Connected to RabbitMQ'));
      this.instance.on('disconnect', (err: any) => console.error('RabbitMQ disconnected', err.err));
    }
    return this.instance;
  }
}
