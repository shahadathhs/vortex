import {
  AuthUser,
  ForbiddenError,
  Permission,
  Role,
  RolePermissions,
} from '@vortex/common';
import { NextFunction, Request, Response } from 'express';

import { orderService } from '../services/order.service';
import { IOrder, OrderStatus } from '../types/order.interface';

interface AuthRequest extends Request {
  user?: AuthUser;
}

function canManageAllOrders(role: string): boolean {
  return (RolePermissions[role as Role] ?? []).includes(
    Permission.ORDER_MANAGE_ALL,
  );
}

export class OrderController {
  public createOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const body = req.body as Partial<IOrder>;
      const order = await orderService.createOrder({
        ...body,
        userId,
      });
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  };

  public getOrders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { userId: queryUserId, status } = req.query as {
        userId?: string;
        status?: OrderStatus;
      };
      const filter: { userId?: string; status?: OrderStatus } = {};
      if (canManageAllOrders(req.user!.role)) {
        if (queryUserId) filter.userId = queryUserId;
        if (status) filter.status = status;
      } else {
        filter.userId = userId;
        if (status) filter.status = status;
      }
      const orders = await orderService.getOrders(filter);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  public getOrderById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const order = await orderService.getOrderById(req.params.id as string);
      if (order.userId !== userId && !canManageAllOrders(req.user!.role)) {
        throw new ForbiddenError('You do not have access to this order');
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  public getOrdersByUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const targetUserId = req.params.userId as string;
      if (targetUserId !== userId && !canManageAllOrders(req.user!.role)) {
        throw new ForbiddenError('You do not have access to these orders');
      }
      const orders = await orderService.getOrdersByUser(targetUserId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  public updateOrderStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!canManageAllOrders(req.user?.role ?? '')) {
        throw new ForbiddenError('Only admins can update order status');
      }
      const order = await orderService.updateOrderStatus(
        req.params.id as string,
        req.body.status as OrderStatus,
      );
      res.json(order);
    } catch (error) {
      next(error);
    }
  };
}

export const orderController = new OrderController();
