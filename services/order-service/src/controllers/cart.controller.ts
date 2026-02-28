import { successResponse } from '@vortex/common';
import { Request, Response } from 'express';

import { cartService } from '../services/cart.service';

export class CartController {
  public getCart = async (req: Request, res: Response) => {
    const cart = await cartService.getCart(req.user!.id);
    res.json(successResponse(cart, 'Cart retrieved'));
  };

  public addItem = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user!.id, {
      productId,
      quantity,
    });
    res.status(201).json(successResponse(cart, 'Item added to cart'));
  };

  public updateItem = async (req: Request, res: Response) => {
    const productId = String(req.params.productId ?? '');
    const { quantity } = req.body;
    const cart = await cartService.updateItem(
      req.user!.id,
      productId,
      quantity,
    );
    res.json(successResponse(cart, 'Cart item updated'));
  };

  public removeItem = async (req: Request, res: Response) => {
    const productId = String(req.params.productId ?? '');
    const cart = await cartService.removeItem(req.user!.id, productId);
    res.json(successResponse(cart, 'Item removed from cart'));
  };

  public clearCart = async (req: Request, res: Response) => {
    const cart = await cartService.clearCart(req.user!.id);
    res.json(successResponse(cart, 'Cart cleared'));
  };
}

export const cartController = new CartController();
