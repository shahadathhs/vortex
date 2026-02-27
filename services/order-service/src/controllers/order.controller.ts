import { NextFunction, Request, Response } from 'express';

import { orderService } from '../services/order.service';
import { IOrder, OrderStatus } from '../types/order.interface';

export class OrderController {
  public createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const order = await orderService.createOrder(req.body as Partial<IOrder>);
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
      const { userId, status } = req.query;
      const orders = await orderService.getOrders({
        userId: userId as string,
        status: status as OrderStatus,
      });
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
      const order = await orderService.getOrderById(req.params.id as string);
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
      const orders = await orderService.getOrdersByUser(
        req.params.userId as string,
      );
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
