import { ProductCard } from './ProductCard';
import { getPublicProducts } from '@/lib/api-client';

interface ProductGridProps {
  searchParams: {
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
  };
}

export async function ProductGrid({ searchParams }: ProductGridProps) {
  const page = Number(searchParams.page || '1');
  const limit = Number(searchParams.limit || '12');

  const result = await getPublicProducts({
    ...searchParams,
    page: page.toString(),
    limit: limit.toString(),
  });

  const products = result.data?.products ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: unknown) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
