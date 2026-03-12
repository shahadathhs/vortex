import { apiServerFetch } from '@/lib/api-server';
import { BarChart3 } from 'lucide-react';

export default async function BuyerAnalyticsPage() {
  let data: Record<string, unknown> | null = null;
  try {
    data = await apiServerFetch<Record<string, unknown>>(
      '/analytics/dashboard',
    );
  } catch {
    // Unauthorized or error
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 size={24} />
        <h1 className="text-2xl font-bold">My Analytics</h1>
      </div>

      {!data ? (
        <div className="text-center py-16 text-muted-foreground">
          No analytics data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data)
            .filter(([, value]) => typeof value !== 'object')
            .map(([key, value]) => (
              <div key={key} className="bg-card border rounded-xl p-5">
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {value as string | number | boolean}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
