'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/lib/api';
import { Activity } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function ActivitiesPage() {
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['activities', resource, action],
    queryFn: async () => {
      const res = await activityApi.list({
        resource: resource || undefined,
        action: action || undefined,
      });
      return res.data as Activity[];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity Log</h1>

      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-2.5 text-muted-foreground"
          />
          <input
            placeholder="Resource..."
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="pl-8 pr-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <input
          placeholder="Action..."
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="px-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Time</th>
                <th className="text-left px-4 py-3 font-medium">Actor</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Resource</th>
                <th className="text-left px-4 py-3 font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((a) => (
                <tr
                  key={a._id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(a.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium capitalize">{a.actorRole}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.actorEmail ?? a.actorId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {a.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.resource}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {a.resourceId?.slice(-8) ?? '—'}
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No activities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
