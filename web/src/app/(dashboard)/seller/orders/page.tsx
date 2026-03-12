import { apiServerFetch } from '@/lib/api-server';
import { Order } from '@/types';
import { formatDate, formatPrice, ORDER_STATUS_COLORS } from '@/lib/utils';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function SellerOrdersPage() {
  let data: Order[] = [];
  try {
    data = (await apiServerFetch<Order[]>('/orders')) ?? [];
  } catch {
    // Unauthorized or error
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      {!data?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-20" />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Items</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
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
                  <td className="px-4 py-3 text-right">{order.items.length}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                        ORDER_STATUS_COLORS[order.status],
                      )}
                    >
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
