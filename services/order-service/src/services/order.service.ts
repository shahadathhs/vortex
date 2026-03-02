import {
  ConfirmChannel,
  EventName,
  logger,
  NotFoundError,
  RabbitMQManager,
} from '@vortex/common';

import { env } from '../config/config';
import { Order } from '../models/Order';
import { IOrder, OrderStatus } from '../types/order.interface';

const rabbitMQ = RabbitMQManager.getConnection(env.RABBITMQ_URL);

async function publishToNotification(
  event: EventName,
  data: Record<string, unknown>,
) {
  try {
    const channelWrapper = rabbitMQ.createChannel({
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

async function createOrder(data: Partial<IOrder>) {
  const { userId, userEmail, items, totalPrice } = data;

  const order = await Order.create({
    userId: userId!,
    userEmail,
    items: items ?? [],
    totalPrice: totalPrice!,
    status: 'pending',
  });

  await publishToNotification(EventName.ORDER_CREATED, {
    orderId: String(order._id),
    userId: userId!,
    userEmail: userEmail ?? '',
    totalPrice: totalPrice!,
    items: items ?? [],
  });

  return order;
}

async function getOrders(query: { userId?: string; status?: OrderStatus }) {
  const filter: Record<string, unknown> = {};
  if (query.userId) filter.userId = query.userId;
  if (query.status) filter.status = query.status;
  return Order.find(filter).sort({ createdAt: -1 });
}

async function getOrderById(id: string) {
  const order = await Order.findById(id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  return order;
}

async function getOrdersByUser(userId: string) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await Order.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  await publishToNotification(EventName.ORDER_UPDATED, {
    orderId: String(order._id),
    userId: order.userId,
    userEmail: order.userEmail ?? '',
    status,
    totalPrice: order.totalPrice,
    items: order.items,
  });

  return order;
}

export const orderService = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
};
