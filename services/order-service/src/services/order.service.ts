import { RabbitMQManager } from '@vortex/common';
import { EventName, QueueName } from '@vortex/config';

import { config } from '../config';
import { Order } from '../models/Order';

export class OrderService {
  async createOrder(data: any) {
    const { userId, productId, quantity, totalPrice } = data;

    // Create order in DB
    const order = await Order.create({
      userId,
      productId,
      quantity,
      totalPrice,
    });

    // Emit event to RabbitMQ
    const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);
    const channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: any) =>
        channel.assertQueue(QueueName.NOTIFICATION_QUEUE, { durable: true }),
    });

    await channelWrapper.sendToQueue(QueueName.NOTIFICATION_QUEUE, {
      event: EventName.ORDER_CREATED,
      data: {
        orderId: (order as any)._id,
        userId,
        totalPrice,
      },
    });

    return order;
  }
}

export const orderService = new OrderService();
