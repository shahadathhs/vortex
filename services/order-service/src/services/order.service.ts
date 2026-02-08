import { EventName, QueueName, RabbitMQManager } from '@vortex/common';
import { ConfirmChannel } from 'amqplib';

import { config } from '../config/config';
import { Order } from '../models/Order';
import { IOrder } from '../types/order.interface';

export class OrderService {
  async createOrder(data: Partial<IOrder>) {
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
      setup: (channel: ConfirmChannel) =>
        channel.assertQueue(QueueName.NOTIFICATION_QUEUE, { durable: true }),
    });

    await channelWrapper.sendToQueue(QueueName.NOTIFICATION_QUEUE, {
      event: EventName.ORDER_CREATED,
      data: {
        orderId: order._id.toString(),
        userId,
        totalPrice,
      },
    });

    return order;
  }
}

export const orderService = new OrderService();
