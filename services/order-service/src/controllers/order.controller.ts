import {
  ForbiddenError,
  Permission,
  Role,
  RolePermissions,
  successResponse,
} from '@vortex/common';
import { Request, Response } from 'express';

import { orderService } from '../services/order.service';
import { IOrder, OrderStatus } from '../types/order.interface';

function canManageAllOrders(role: string): boolean {
  return (RolePermissions[role as Role] ?? []).includes(
    Permission.ORDER_MANAGE_ALL,
  );
}

async function createOrder(req: Request, res: Response) {
  const body = req.body as Partial<IOrder>;
  const order = await orderService.createOrder({
    ...body,
    userId: req.user!.id,
    userEmail: req.user!.email,
  });
  res.status(201).json(successResponse(order, 'Order created successfully'));
}

async function getOrders(req: Request, res: Response) {
  const { userId: queryUserId, status } = req.query as {
    userId?: string;
    status?: OrderStatus;
  };
  const filter: { userId?: string; status?: OrderStatus } = {};
  if (canManageAllOrders(req.user!.role)) {
    if (queryUserId) filter.userId = queryUserId;
    if (status) filter.status = status;
  } else {
    filter.userId = req.user!.id;
    if (status) filter.status = status;
  }
  const orders = await orderService.getOrders(filter);
  res.json(successResponse(orders, 'Orders retrieved'));
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
  const orders = await orderService.getOrdersByUser(targetUserId);
  res.json(successResponse(orders, 'Orders retrieved'));
}

async function updateOrderStatus(req: Request, res: Response) {
  if (!canManageAllOrders(req.user?.role ?? '')) {
    throw new ForbiddenError('Only admins can update order status');
  }
  const id = String(req.params.id ?? '');
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(id, status);
  res.json(successResponse(order, 'Order status updated'));
}

export const orderController = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
};
