'use client';

import { useState, useEffect, useCallback } from 'react';
import { cartApi, productApi } from '@/lib/api';
import { Cart, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      const c = (await cartApi.get()) as Cart;
      setCart(c);
      if (c?.items?.length) {
        const p = (await productApi.list()) as Product[];
        setProducts(p);
      } else {
        setProducts([]);
      }
    } catch {
      setCart(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const updateQty = async (productId: string, quantity: number) => {
    try {
      await cartApi.update(productId, { quantity });
      await loadCart();
    } catch {
      // Error
    }
  };

  const remove = async (productId: string) => {
    try {
      await cartApi.remove(productId);
      await loadCart();
    } catch {
      // Error
    }
  };

  const clear = async () => {
    try {
      await cartApi.clear();
      await loadCart();
    } catch {
      // Error
    }
  };

  const productMap = new Map(products.map((p) => [p._id, p]));
  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => {
    const p = productMap.get(item.productId);
    return sum + (p?.price ?? 0) * item.quantity;
  }, 0);

  if (loading)
    return (
      <div className="text-center py-16 text-muted-foreground">Loading...</div>
    );

  if (!items.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <button
          onClick={() => router.push('/buyer/shop')}
          className="mt-4 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cart ({items.length} items)</h1>
        <button
          onClick={() => clear()}
          className="text-sm text-destructive hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const product = productMap.get(item.productId);
          return (
            <div
              key={item.productId}
              className="bg-card border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="bg-muted rounded-lg w-16 h-16 flex-shrink-0 flex items-center justify-center">
                <ShoppingBag
                  size={20}
                  className="text-muted-foreground opacity-30"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {product?.name ?? item.productId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product ? formatPrice(product.price) : '—'} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQty(item.productId, Math.max(1, item.quantity - 1))
                  }
                  className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-accent"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQty(item.productId, item.quantity + 1)}
                  className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-accent"
                >
                  <Plus size={12} />
                </button>
              </div>
              <p className="font-semibold w-20 text-right">
                {product ? formatPrice(product.price * item.quantity) : '—'}
              </p>
              <button
                onClick={() => remove(item.productId)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{formatPrice(total)}</p>
        </div>
        <button
          onClick={() => router.push('/buyer/checkout')}
          className="rounded-md bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:opacity-90"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
