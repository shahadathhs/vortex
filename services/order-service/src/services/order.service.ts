import type { ConfirmChannel } from 'amqplib';

import {
  EXCHANGE,
  EXCHANGE_TYPE,
  EventName,
  logger,
  NotFoundError,
  RabbitMQManager,
} from '@vortex/common';

import { config } from '../config/config';
import { Order } from '../models/Order';
import { IOrder, OrderStatus } from '../types/order.interface';

const rabbitMQ = RabbitMQManager.getConnection(config.RABBITMQ_URL);

async function publishToNotification(
  event: EventName,
  data: Record<string, unknown>,
) {
  try {
    const channelWrapper = rabbitMQ.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, {
          durable: true,
        });
      },
    });

    const payload = { event, timestamp: new Date(), data };
    await channelWrapper.publish(EXCHANGE, event, payload);

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

async function getOrders(query: {
  userId?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.userId) filter.userId = query.userId;
  if (query.status) filter.status = query.status;

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from)
      (filter.createdAt as Record<string, Date>).$gte = query.from;
    if (query.to) (filter.createdAt as Record<string, Date>).$lte = query.to;
  }

  if (query.search?.trim()) {
    const { buildSearchOr } = await import('@vortex/common');
    const searchOr = buildSearchOr(['userEmail'], query.search);
    if (searchOr) {
      filter.$and = filter.$and ?? [];
      (filter.$and as Record<string, unknown>[]).push(searchOr);
    }
  }

  const skip = query.skip ?? 0;
  const limit = query.limit ?? 20;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, total };
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
