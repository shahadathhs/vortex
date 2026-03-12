import { apiServerFetch } from '@/lib/api-server';
import { Activity } from '@/types';
import { formatDate } from '@/lib/utils';
import { ActivitiesFilters } from './ActivitiesFilters';

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string; action?: string }>;
}) {
  const params = await searchParams;
  const resource = params.resource ?? '';
  const action = params.action ?? '';

  let data: Activity[] = [];
  try {
    const qs = new URLSearchParams();
    if (resource) qs.set('resource', resource);
    if (action) qs.set('action', action);
    const path = `/activities${qs.toString() ? `?${qs}` : ''}`;
    data = (await apiServerFetch<Activity[]>(path)) ?? [];
  } catch {
    // Unauthorized or error
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity Log</h1>

      <ActivitiesFilters resource={resource} action={action} />

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
            {data.map((a) => (
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
            {!data.length && (
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
    </div>
  );
}
