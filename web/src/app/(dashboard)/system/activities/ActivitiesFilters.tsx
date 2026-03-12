'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function ActivitiesFilters({
  resource,
  action,
}: {
  resource: string;
  action: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`?${next.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <input
          placeholder="Resource..."
          value={resource}
          onChange={(e) => update('resource', e.target.value)}
          className="pl-8 pr-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <input
        placeholder="Action..."
        value={action}
        onChange={(e) => update('action', e.target.value)}
        className="px-3 py-2 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
