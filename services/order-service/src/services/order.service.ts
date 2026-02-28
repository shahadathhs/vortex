import {
  ConfirmChannel,
  EventName,
  logger,
  NotFoundError,
  RabbitMQManager,
} from '@vortex/common';

import { config } from '../config/config';
import { Order } from '../models/Order';
import { IOrder, OrderStatus } from '../types/order.interface';

export class OrderService {
  private rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

  async createOrder(data: Partial<IOrder>) {
    const { userId, items, totalPrice } = data;

    const order = await Order.create({
      userId: userId!,
      items: items ?? [],
      totalPrice: totalPrice!,
      status: 'pending',
    });

    await this.publishToNotification(EventName.ORDER_CREATED, {
      orderId: String(order._id),
      userId: userId!,
      totalPrice: totalPrice!,
      items: items ?? [],
    });

    return order;
  }

  async getOrders(query: { userId?: string; status?: OrderStatus }) {
    const filter: Record<string, unknown> = {};
    if (query.userId) filter.userId = query.userId;
    if (query.status) filter.status = query.status;
    return Order.find(filter).sort({ createdAt: -1 });
  }

  async getOrderById(id: string) {
    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    return order;
  }

  async getOrdersByUser(userId: string) {
    return Order.find({ userId }).sort({ createdAt: -1 });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await this.publishToNotification(EventName.ORDER_UPDATED, {
      orderId: String(order._id),
      userId: order.userId,
      status,
      totalPrice: order.totalPrice,
    });

    return order;
  }

  private async publishToNotification(
    event: EventName,
    data: Record<string, unknown>,
  ) {
    try {
      const channelWrapper = this.rabbitMQ.createChannel({
        json: true,
        setup: async (channel: ConfirmChannel) => {
          await channel.assertExchange('vortex', 'topic', { durable: true });
        },
      });

      const payload = { event, timestamp: new Date(), data };
      await channelWrapper.publish('vortex', event, payload);

      logger.info(`📤 Published ${event} to vortex exchange`);
    } catch (error) {
      logger.error(`Failed to publish ${event}:`, error);
    }
  }
}

export const orderService = new OrderService();
