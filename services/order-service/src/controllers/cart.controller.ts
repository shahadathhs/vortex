import { NextFunction, Request, Response } from 'express';

import { cartService } from '../services/cart.service';
import { ICartItem } from '../types/cart.interface';

function getUserIdFromQuery(q: Request['query']): string {
  const v = q.userId;
  return typeof v === 'string' ? v : '';
}

export class CartController {
  public getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserIdFromQuery(req.query);
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, productId, quantity } = req.body;
      if (!userId || !productId || !quantity) {
        res.status(400).json({
          message: 'userId, productId, and quantity are required',
        });
        return;
      }
      const cart = await cartService.addItem(userId, {
        productId,
        quantity,
      } as ICartItem);
      res.status(201).json(cart);
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getUserIdFromQuery(req.query);
      const productId =
        typeof req.params.productId === 'string' ? req.params.productId : '';
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }
      const cart = await cartService.updateItem(
        userId,
        productId,
        Number(req.body.quantity ?? 0),
      );
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public removeItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getUserIdFromQuery(req.query);
      const productId =
        typeof req.params.productId === 'string' ? req.params.productId : '';
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }
      const cart = await cartService.removeItem(userId, productId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public clearCart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId =
        getUserIdFromQuery(req.query) ||
        (typeof req.body.userId === 'string' ? req.body.userId : '');
      if (!userId) {
        res.status(400).json({ message: 'userId is required' });
        return;
      }
      const cart = await cartService.clearCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController();
