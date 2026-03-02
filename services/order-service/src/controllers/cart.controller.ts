import { HttpStatusCode, successResponse } from '@vortex/common';
import { Request, Response } from 'express';

import { cartService } from '../services/cart.service';

async function getCart(req: Request, res: Response) {
  const cart = await cartService.getCart(req.user!.id);
  res.json(successResponse(cart, 'Cart retrieved'));
}

async function addItem(req: Request, res: Response) {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(req.user!.id, {
    productId,
    quantity,
  });
  res
    .status(HttpStatusCode.CREATED)
    .json(successResponse(cart, 'Item added to cart'));
}

async function updateItem(req: Request, res: Response) {
  const productId = String(req.params.productId ?? '');
  const { quantity } = req.body;
  const cart = await cartService.updateItem(req.user!.id, productId, quantity);
  res.json(successResponse(cart, 'Cart item updated'));
}

async function removeItem(req: Request, res: Response) {
  const productId = String(req.params.productId ?? '');
  const cart = await cartService.removeItem(req.user!.id, productId);
  res.json(successResponse(cart, 'Item removed from cart'));
}

async function clearCart(req: Request, res: Response) {
  const cart = await cartService.clearCart(req.user!.id);
  res.json(successResponse(cart, 'Cart cleared'));
}

export const cartController = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
