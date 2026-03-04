import {
  ForbiddenError,
  getDateRangeFromPreset,
  getPagination,
  Permission,
  publishActivity,
  Role,
  RolePermissions,
  successPaginatedResponse,
  successResponse,
} from '@vortex/common';
import { Request, Response } from 'express';

import { config } from '../config/config';
import { orderService } from '../services/order.service';
import { IOrder, OrderStatus } from '../types/order.interface';

function canManageAllOrders(role: string): boolean {
  return (RolePermissions[role as Role] ?? []).includes(
    Permission.ORDER_MANAGE_ALL,
  );
}

function getReqMeta(req: Request) {
  return {
    ip: req.ip ?? req.socket?.remoteAddress,
    userAgent: req.get('user-agent'),
  };
}

async function createOrder(req: Request, res: Response) {
  const body = req.body as Partial<IOrder>;
  const order = await orderService.createOrder({
    ...body,
    userId: req.user!.id,
    userEmail: req.user!.email,
  });
  await publishActivity(config.RABBITMQ_URL, {
    actorId: req.user!.id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'order.created',
    resource: 'order',
    resourceId: String(order._id),
    metadata: { totalPrice: order.totalPrice, status: order.status },
    ...getReqMeta(req),
  });
  res.status(201).json(successResponse(order, 'Order created successfully'));
}

async function getOrders(req: Request, res: Response) {
  const {
    userId: queryUserId,
    status,
    dateFilter,
    search,
  } = req.query as {
    userId?: string;
    status?: OrderStatus;
    dateFilter?: string;
    search?: string;
  };
  const { page, limit, skip } = getPagination(req.query);

  const filter: {
    userId?: string;
    status?: OrderStatus;
    from?: Date;
    to?: Date;
    search?: string;
    skip?: number;
    limit?: number;
  } = { skip, limit };

  if (canManageAllOrders(req.user!.role)) {
    if (queryUserId) filter.userId = queryUserId;
    if (status) filter.status = status;
  } else {
    filter.userId = req.user!.id;
    if (status) filter.status = status;
  }

  const dateRange = dateFilter ? getDateRangeFromPreset(dateFilter) : null;
  if (dateRange) {
    filter.from = dateRange.from;
    filter.to = dateRange.to;
  }
  if (search) filter.search = search;

  const { orders, total } = await orderService.getOrders(filter);
  res.json(
    successPaginatedResponse(
      orders,
      { page, limit, total },
      'Orders retrieved',
    ),
  );
}

async function getOrderById(req: Request, res: Response) {
  const order = await orderService.getOrderById(String(req.params.id ?? ''));
  if (order.userId !== req.user!.id && !canManageAllOrders(req.user!.role)) {
    throw new ForbiddenError('You do not have access to this order');
  }
  res.json(successResponse(order, 'Order retrieved'));
}

async function getOrdersByUser(req: Request, res: Response) {
  const targetUserId = String(req.params.userId ?? '');
  if (targetUserId !== req.user!.id && !canManageAllOrders(req.user!.role)) {
    throw new ForbiddenError('You do not have access to these orders');
  }
  const { page, limit, skip } = getPagination(req.query);
  const { dateFilter, search } = req.query as {
    dateFilter?: string;
    search?: string;
  };

  const filter: Parameters<typeof orderService.getOrders>[0] = {
    userId: targetUserId,
    skip,
    limit,
  };
  const dateRange = dateFilter ? getDateRangeFromPreset(dateFilter) : null;
  if (dateRange) {
    filter.from = dateRange.from;
    filter.to = dateRange.to;
  }
  if (search) filter.search = search;

  const { orders, total } = await orderService.getOrders(filter);
  res.json(
    successPaginatedResponse(
      orders,
      { page, limit, total },
      'Orders retrieved',
    ),
  );
}

async function updateOrderStatus(req: Request, res: Response) {
  if (!canManageAllOrders(req.user?.role ?? '')) {
    throw new ForbiddenError('Only system can update order status');
  }
  const id = String(req.params.id ?? '');
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(id, status);
  await publishActivity(config.RABBITMQ_URL, {
    actorId: req.user!.id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'order.status_updated',
    resource: 'order',
    resourceId: id,
    metadata: { status },
    ...getReqMeta(req),
  });
  res.json(successResponse(order, 'Order status updated'));
}

export const orderController = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
};
