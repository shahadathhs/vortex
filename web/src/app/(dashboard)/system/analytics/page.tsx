'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { BarChart3 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function SystemAnalyticsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const res = await analyticsApi.getDashboard();
      return res as Record<string, unknown>;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['analytics-orders'],
    queryFn: async () => {
      const res = await analyticsApi.getOrders();
      return res as Record<string, unknown>;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['analytics-products'],
    queryFn: async () => {
      const res = await analyticsApi.getProducts();
      return res as Record<string, unknown>;
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-16 text-muted-foreground">Loading...</div>
    );

  const allStats = {
    ...(dashboard ?? {}),
    ...(orders ?? {}),
    ...(products ?? {}),
  };
  const scalarStats = Object.entries(allStats).filter(
    ([, v]) => typeof v !== 'object',
  );
  const recentOrders = (dashboard as { recentOrders?: Order[] })?.recentOrders;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 size={24} />
        <h1 className="text-2xl font-bold">System Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scalarStats.map(([key, value]) => (
          <div key={key} className="bg-card border rounded-xl p-5">
            <p className="text-sm text-muted-foreground capitalize">
              {key.replace(/_/g, ' ')}
            </p>
            <p className="text-3xl font-bold mt-1">
              {typeof value === 'number' &&
              key.toLowerCase().includes('revenue')
                ? formatPrice(value)
                : (value as string | number | boolean)}
            </p>
          </div>
        ))}
      </div>

      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded-full">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
