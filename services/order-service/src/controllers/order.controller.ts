import { NextFunction, Request, Response } from 'express';

import { orderService } from '../services/order.service';
import { IOrder } from '../types/order.interface';

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
}

export const orderController = new OrderController();
