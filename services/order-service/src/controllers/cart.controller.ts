import { NextFunction, Request, Response } from 'express';

import { cartService } from '../services/cart.service';

export class CartController {
  public getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await cartService.getCart(req.user!.id);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = String(req.body.productId ?? '');
      const quantity = Number(req.body.quantity ?? 0);
      const cart = await cartService.addItem(req.user!.id, {
        productId,
        quantity,
      });
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
      const productId = String(req.params.productId ?? '');
      const { quantity } = req.body;
      const cart = await cartService.updateItem(
        req.user!.id,
        productId,
        quantity,
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
      const productId = String(req.params.productId ?? '');
      const cart = await cartService.removeItem(req.user!.id, productId);
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
      const cart = await cartService.clearCart(req.user!.id);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController();
