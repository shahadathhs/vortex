import { apiServerFetch } from '@/lib/api-server';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { ShopFilters } from './ShopFilters';
import { AddToCartButton } from './AddToCartButton';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? '';
  const category = params.category ?? '';

  let data: Product[] = [];
  try {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    const path = `/products${qs.toString() ? `?${qs}` : ''}`;
    data = (await apiServerFetch<Product[]>(path)) ?? [];
  } catch {
    // Unauthorized or error
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shop</h1>
        <ShopFilters search={search} category={category} />
      </div>

      {!data?.length ? (
        <div className="text-center py-16 text-muted-foreground">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((product) => (
            <div
              key={product._id}
              className="bg-card border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="bg-muted rounded-lg h-40 flex items-center justify-center">
                <ShoppingCart
                  size={32}
                  className="text-muted-foreground opacity-30"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
                {product.category && (
                  <span className="inline-block mt-1.5 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">{formatPrice(product.price)}</span>
                <span className="text-xs text-muted-foreground">
                  {product.stock} in stock
                </span>
              </div>
              <AddToCartButton productId={product._id} stock={product.stock} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
