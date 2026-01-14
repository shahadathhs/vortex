import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
