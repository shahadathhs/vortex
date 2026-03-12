'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function ShopFilters({
  search,
  category,
}: {
  search: string;
  category: string;
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
    <div className="flex gap-2">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-2.5 top-2.5 text-muted-foreground"
        />
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => update('search', e.target.value)}
          className="pl-8 pr-3 py-2 rounded-md border bg-transparent text-sm w-56 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <input
        placeholder="Category"
        value={category}
        onChange={(e) => update('category', e.target.value)}
        className="px-3 py-2 rounded-md border bg-transparent text-sm w-36 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
