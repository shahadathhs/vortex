import { config } from '../config/config';

export async function fetchOrders() {
  const res = await fetch(`${config.ORDER_SERVICE_URL}/api/internal/orders`, {
    headers: { 'X-Internal-Secret': config.INTERNAL_SECRET },
  });
  if (!res.ok) throw new Error(`Orders fetch failed: ${res.status}`);
  const json = (await res.json()) as { data?: unknown };
  return (json.data ?? json) as {
    _id: string;
    userId: string;
    userEmail?: string;
    items: { productId: string; quantity: number; price: number }[];
    totalPrice: number;
    status: string;
    createdAt: string;
  }[];
}

export async function fetchProducts() {
  const res = await fetch(`${config.PRODUCT_SERVICE_URL}/api/products`);
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const json = (await res.json()) as { data?: unknown };
  return (json.data ?? json) as {
    _id: string;
    name: string;
    price: number;
    stock: number;
    sellerId?: string;
    category?: string;
  }[];
}
