import { NotFoundError } from '@vortex/common';

import { Cart } from '../models/Cart';
import { ICartItem } from '../types/cart.interface';

async function getCart(userId: string) {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
    { new: true, upsert: true },
  );
  return cart;
}

async function addItem(userId: string, item: ICartItem) {
  let cart = await Cart.findOne({ userId });
  cart ??= await Cart.create({ userId, items: [] });

  const existingIndex = cart.items.findIndex(
    (i) => i.productId === item.productId,
  );
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity;
  } else {
    cart.items.push(item);
  }
  await cart.save();
  return cart;
}

async function updateItem(userId: string, productId: string, quantity: number) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  const item = cart.items.find((i) => i.productId === productId);
  if (!item) {
    throw new NotFoundError('Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  return cart;
}

async function removeItem(userId: string, productId: string) {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.productId !== productId);
  await cart.save();
  return cart;
}

async function clearCart(userId: string) {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { items: [] },
    { new: true },
  );
  if (!cart) {
    return await Cart.create({ userId, items: [] });
  }
  return cart;
}

export const cartService = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
