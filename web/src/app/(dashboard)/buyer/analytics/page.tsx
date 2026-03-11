'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { BarChart3 } from 'lucide-react';

export default function BuyerAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const res = await analyticsApi.getDashboard();
      return res.data as Record<string, unknown>;
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-16 text-muted-foreground">Loading...</div>
    );

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
          {Object.entries(data).map(
            ([key, value]) =>
              typeof value !== 'object' && (
                <div key={key} className="bg-card border rounded-xl p-5">
                  <p className="text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {value as string | number | boolean}
                  </p>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
