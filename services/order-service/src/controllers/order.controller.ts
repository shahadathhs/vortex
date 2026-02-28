import {
  ForbiddenError,
  Permission,
  Role,
  RolePermissions,
} from '@vortex/common';
import { NextFunction, Request, Response } from 'express';

import { orderService } from '../services/order.service';
import { IOrder, OrderStatus } from '../types/order.interface';

function canManageAllOrders(role: string): boolean {
  return (RolePermissions[role as Role] ?? []).includes(
    Permission.ORDER_MANAGE_ALL,
  );
}

export class OrderController {
  public createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as Partial<IOrder>;
      const order = await orderService.createOrder({
        ...body,
        userId: req.user!.id,
      });
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  };

  public getOrders = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
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
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  public getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const order = await orderService.getOrderById(
        String(req.params.id ?? ''),
      );
      if (
        order.userId !== req.user!.id &&
        !canManageAllOrders(req.user!.role)
      ) {
        throw new ForbiddenError('You do not have access to this order');
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  public getOrdersByUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetUserId = String(req.params.userId ?? '');
      if (
        targetUserId !== req.user!.id &&
        !canManageAllOrders(req.user!.role)
      ) {
        throw new ForbiddenError('You do not have access to these orders');
      }
      const orders = await orderService.getOrdersByUser(targetUserId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  public updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!canManageAllOrders(req.user?.role ?? '')) {
        throw new ForbiddenError('Only admins can update order status');
      }
      const id = String(req.params.id ?? '');
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };
}

export const orderController = new OrderController();
