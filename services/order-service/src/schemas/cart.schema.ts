import { z } from 'zod';

export const getCartSchema = z.object({
  query: z.object({}).passthrough().optional(),
});

export const clearCartSchema = z.object({
  body: z.object({}).passthrough().optional(),
});

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().nonnegative('Quantity must be non-negative'),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});
