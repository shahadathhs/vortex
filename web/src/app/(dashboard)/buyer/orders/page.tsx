'use client';

import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';
import { formatDate, formatPrice, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BuyerOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: async () => {
      const res = await orderApi.list();
      return res as Order[];
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-16 text-muted-foreground">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {!data?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p>No orders yet. Start shopping!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((order) => (
            <div
              key={order._id}
              className="bg-card border rounded-xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {order._id}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                    ORDER_STATUS_COLORS[order.status],
                  )}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productId} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
