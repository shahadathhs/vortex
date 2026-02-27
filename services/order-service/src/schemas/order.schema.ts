import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

export const createOrderSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    totalPrice: z.number().positive('Total price must be positive'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
    ]),
  }),
});
