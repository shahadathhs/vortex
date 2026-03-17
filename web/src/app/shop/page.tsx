import { Suspense } from 'react';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { ProductSort } from '@/components/shop/ProductSort';

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    tags?: string;
    hasVariants?: string;
    inStock?: string;
    sort?: string;
    order?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
            }
          >
            <ProductFilters searchParams={params} />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header with Sort */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Shop Products</h1>
            <Suspense
              fallback={
                <div className="h-10 w-40 animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />
              }
            >
              <ProductSort searchParams={params} />
            </Suspense>
          </div>

          {/* Products */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
        >
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
