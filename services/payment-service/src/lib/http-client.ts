import { config } from '../config/config';

const orderUrl = config.ORDER_SERVICE_URL;
const productUrl = config.PRODUCT_SERVICE_URL;
const internalSecret = config.INTERNAL_SECRET;

export async function getCart(authHeader: string) {
  const res = await fetch(`${orderUrl}/api/cart`, {
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error(`Cart fetch failed: ${res.status}`);
  return res.json() as Promise<{
    data?: { items?: { productId: string; quantity: number }[] };
  }>;
}

export async function createOrder(body: {
  userId: string;
  userEmail?: string;
  items: { productId: string; quantity: number; price: number }[];
  totalPrice: number;
}) {
  const res = await fetch(`${orderUrl}/api/internal/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': internalSecret,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Order create failed: ${res.status}`);
  }
  return res.json() as Promise<{ data?: { id?: string; _id?: string } }>;
}

export async function getOrder(orderId: string) {
  const res = await fetch(`${orderUrl}/api/internal/orders/${orderId}`, {
    headers: { 'X-Internal-Secret': internalSecret },
  });
  if (!res.ok) throw new Error(`Order fetch failed: ${res.status}`);
  return res.json() as Promise<{ data?: { userId?: string } }>;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${orderUrl}/api/internal/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': internalSecret,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Order status update failed: ${res.status}`);
  return res.json() as Promise<{ data?: unknown }>;
}

export async function clearCartInternal(userId: string) {
  const res = await fetch(`${orderUrl}/api/internal/cart/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': internalSecret,
    },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(`Cart clear failed: ${res.status}`);
  return res.json() as Promise<{ data?: unknown }>;
}

export async function getProduct(productId: string) {
  const res = await fetch(`${productUrl}/api/products/${productId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Product fetch failed: ${res.status}`);
  }
  return res.json() as Promise<{ data?: { price?: number; stock?: number } }>;
}
