import { AuthUser } from '@vortex/common';
import { NextFunction, Request, Response } from 'express';

import { cartService } from '../services/cart.service';
import { ICartItem } from '../types/cart.interface';

interface AuthRequest extends Request {
  user?: AuthUser;
}

export class CartController {
  public getCart = async (
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
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (
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
      const { productId, quantity } = req.body as {
        productId: string;
        quantity: number;
      };
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
      const productId = String(req.params.productId ?? '');
      const { quantity } = req.body as { quantity: number };
      const cart = await cartService.updateItem(userId, productId, quantity);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public removeItem = async (
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
      const productId = String(req.params.productId ?? '');
      const cart = await cartService.removeItem(userId, productId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public clearCart = async (
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
      const cart = await cartService.clearCart(userId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController();
