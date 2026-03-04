import { config } from '../config/config';

export interface OrderItem {
  _id: string;
  userId: string;
  userEmail?: string;
  items: { productId: string; quantity: number; price: number }[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface ProductItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sellerId?: string;
  category?: string;
}

export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<
  | OrderItem[]
  | {
      data: OrderItem[];
      pagination: { page: number; limit: number; total: number };
    }
> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  const url = `${config.ORDER_SERVICE_URL}/api/internal/orders${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: { 'X-Internal-Secret': config.INTERNAL_SECRET },
  });
  if (!res.ok) throw new Error(`Orders fetch failed: ${res.status}`);
  const json = (await res.json()) as {
    data?:
      | OrderItem[]
      | {
          data?: OrderItem[];
          pagination?: { page: number; limit: number; total: number };
        };
  };
  const data = json.data;
  if (Array.isArray(data)) {
    return data;
  }
  const obj = data as {
    data?: OrderItem[];
    pagination?: { page: number; limit: number; total: number };
  };
  if (obj?.pagination) {
    return {
      data: obj.data ?? [],
      pagination: obj.pagination,
    };
  }
  return (data as OrderItem[]) ?? [];
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<
  | ProductItem[]
  | {
      data: ProductItem[];
      metadata: { page: number; limit: number; total: number };
    }
> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  if (params?.category) searchParams.set('category', params.category);
  const qs = searchParams.toString();
  const url = `${config.PRODUCT_SERVICE_URL}/api/products${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  const json = (await res.json()) as {
    data?: ProductItem[];
    metadata?: { page: number; limit: number; total: number };
  };
  const data = json.data ?? [];
  const metadata = json.metadata;
  if (params?.page != null && metadata) {
    return { data: Array.isArray(data) ? data : [], metadata };
  }
  return Array.isArray(data) ? data : [];
}
