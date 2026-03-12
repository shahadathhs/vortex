'use server';

import { apiServerFetch } from '@/lib/api-server';
import { revalidatePath } from 'next/cache';

export async function addToCartAction(productId: string) {
  await apiServerFetch('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 }),
  });
  revalidatePath('/buyer/shop');
  revalidatePath('/buyer/cart');
}
