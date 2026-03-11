'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartApi, orderApi, productApi } from '@/lib/api';
import { Cart, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.get();
      return res as Cart;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: async () => {
      const res = await productApi.list();
      return res as Product[];
    },
    enabled: !!cart?.items?.length,
  });

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
        <h1 className="text-2xl font-bold mb-2">Order placed!</h1>
        <p className="text-muted-foreground">
          Your payment was successful. Check your orders for details.
        </p>
        <a
          href="/buyer/orders"
          className="mt-6 inline-block rounded-md bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:opacity-90"
        >
          View orders
        </a>
      </div>
    );
  }

  if (status === 'cancel') {
    return (
      <div className="text-center py-16">
        <XCircle size={64} className="mx-auto mb-4 text-destructive" />
        <h1 className="text-2xl font-bold mb-2">Payment cancelled</h1>
        <p className="text-muted-foreground">Your order was not completed.</p>
        <a
          href="/buyer/cart"
          className="mt-6 inline-block rounded-md bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:opacity-90"
        >
          Back to cart
        </a>
      </div>
    );
  }

  const productMap = new Map(products?.map((p) => [p._id, p]) ?? []);
  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => {
    const p = productMap.get(item.productId);
    return sum + (p?.price ?? 0) * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await orderApi.checkout({});
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Order Summary</h2>
        {items.map((item) => {
          const product = productMap.get(item.productId);
          return (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {product?.name ?? item.productId} × {item.quantity}
              </span>
              <span>
                {product ? formatPrice(product.price * item.quantity) : '—'}
              </span>
            </div>
          );
        })}
        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={isLoading || !items.length}
        className="w-full rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
      </button>
      <p className="text-xs text-center text-muted-foreground">
        You will be redirected to Stripe to complete your payment securely.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
