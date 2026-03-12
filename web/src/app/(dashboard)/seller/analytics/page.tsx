import { apiServerFetch } from '@/lib/api-server';
import { BarChart3 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function SellerAnalyticsPage() {
  let dashboard: Record<string, unknown> = {};
  let orders: Record<string, unknown> = {};
  try {
    const [d, o] = await Promise.all([
      apiServerFetch<Record<string, unknown>>('/analytics/dashboard'),
      apiServerFetch<Record<string, unknown>>('/analytics/orders'),
    ]);
    dashboard = d ?? {};
    orders = o ?? {};
  } catch {
    // Unauthorized or error
  }

  const stats = { ...dashboard, ...orders };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 size={24} />
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats)
          .filter(([, value]) => typeof value !== 'object')
          .map(([key, value]) => (
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
    </div>
  );
}
