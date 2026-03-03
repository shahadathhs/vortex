import { BadRequestError } from '@vortex/common';

import {
  clearCartInternal,
  createOrder,
  getCart,
  getProduct,
  updateOrderStatus,
} from '../lib/http-client';
import { createPaymentIntent } from './stripe.service';

interface CartItem {
  productId: string;
  quantity: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export async function checkout(
  authHeader: string,
  userId: string,
  userEmail?: string,
) {
  const cartRes = await getCart(authHeader);
  const cart = (cartRes as { data?: { items?: CartItem[] } })?.data ?? cartRes;
  const items = (cart as { items?: CartItem[] })?.items ?? [];

  if (!items.length) {
    throw new BadRequestError('Cart is empty');
  }

  const orderItems: OrderItem[] = [];
  let totalPrice = 0;

  for (const item of items) {
    const productRes = await getProduct(item.productId);
    const product =
      (productRes as { data?: { price?: number; stock?: number } })?.data ??
      productRes;

    if (!product) {
      throw new BadRequestError(`Product ${item.productId} not found`);
    }

    const price = (product as { price?: number }).price ?? 0;
    const stock = (product as { stock?: number }).stock ?? 0;

    if (stock < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for product ${item.productId}`,
      );
    }

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price,
    });
    totalPrice += price * item.quantity;
  }

  const orderRes = await createOrder({
    userId,
    userEmail,
    items: orderItems,
    totalPrice,
  });
  const orderData =
    (orderRes as { data?: { id?: string; _id?: string } })?.data ?? orderRes;
  const orderId =
    (orderData as { id?: string })?.id ?? (orderData as { _id?: string })?._id;

  if (!orderId) {
    throw new BadRequestError('Failed to create order');
  }

  const paymentIntent = await createPaymentIntent(
    Math.round(totalPrice * 100),
    orderId,
  );

  return {
    orderId,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function handlePaymentSucceeded(orderId: string) {
  const { getOrder } = await import('../lib/http-client');
  const orderRes = await getOrder(orderId);
  const order = (orderRes as { data?: { userId?: string } })?.data ?? orderRes;
  const userId = (order as { userId?: string })?.userId;

  await updateOrderStatus(orderId, 'confirmed');

  if (userId) {
    await clearCartInternal(userId);
  }
}

export async function handlePaymentFailed(orderId: string) {
  await updateOrderStatus(orderId, 'cancelled');
}
