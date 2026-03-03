import { BadRequestError, successResponse } from '@vortex/common';
import type { Request, Response } from 'express';

import { cartService } from '../services/cart.service';
import { orderService } from '../services/order.service';
import type { OrderStatus } from '../types/order.interface';

async function createOrder(req: Request, res: Response) {
  const { userId, userEmail, items, totalPrice } = req.body;
  if (!userId || !items || totalPrice === undefined) {
    throw new BadRequestError('userId, items, and totalPrice are required');
  }
  const order = await orderService.createOrder({
    userId,
    userEmail,
    items,
    totalPrice,
  });
  res.status(201).json(successResponse(order, 'Order created'));
}

async function getOrder(req: Request, res: Response) {
  const id = String(req.params.id ?? '');
  const order = await orderService.getOrderById(id);
  res.json(successResponse(order, 'Order retrieved'));
}

async function listOrders(req: Request, res: Response) {
  const { status, limit } = req.query;
  const orders = await orderService.getOrders({
    status: status as OrderStatus | undefined,
  });
  const capped =
    typeof limit === 'string'
      ? orders.slice(0, Math.min(1000, parseInt(limit, 10) || 100))
      : orders;
  res.json(successResponse(capped, 'Orders retrieved'));
}

async function clearCart(req: Request, res: Response) {
  const userId = req.body?.userId;
  if (!userId || typeof userId !== 'string') {
    throw new BadRequestError('userId is required');
  }
  const cart = await cartService.clearCart(userId);
  res.json(successResponse(cart, 'Cart cleared'));
}

async function updateOrderStatus(req: Request, res: Response) {
  const id = String(req.params.id ?? '');
  const { status } = req.body;
  if (!status) {
    throw new BadRequestError('status is required');
  }
  const order = await orderService.updateOrderStatus(id, status);
  res.json(successResponse(order, 'Order status updated'));
}

export const internalController = {
  createOrder,
  getOrder,
  listOrders,
  clearCart,
  updateOrderStatus,
};
