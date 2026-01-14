import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
  }),
});
