import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import Link from 'next/link';

interface ProductFiltersProps {
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    hasVariants?: string;
  };
}

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/categories`, {
      next: { revalidate: 600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getBrands() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/brands`, {
      next: { revalidate: 600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

function buildUrl(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `/shop?${queryString}` : '/shop';
}

export async function ProductFilters({ searchParams }: ProductFiltersProps) {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const currentCategory = searchParams.category;
  const currentBrand = searchParams.brand;
  const minPrice = Number(searchParams.minPrice) || 0;
  const maxPrice = Number(searchParams.maxPrice) || 1000;
  const minRating = Number(searchParams.minRating) || 0;
  const inStock = searchParams.inStock === 'true';
  const hasVariants = searchParams.hasVariants === 'true';

  const hasActiveFilters =
    currentCategory ||
    currentBrand ||
    minPrice > 0 ||
    maxPrice < 1000 ||
    minRating > 0 ||
    inStock ||
    hasVariants;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-lg">Filters</h2>
        {hasActiveFilters && (
          <Link
            href="/shop"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear All
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category: any) => {
                const isActive = currentCategory === category.slug;
                return (
                  <Link
                    key={category.id}
                    href={buildUrl({
                      ...searchParams,
                      category: isActive ? undefined : category.slug,
                    })}
                    className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Checkbox checked={isActive} />
                    <Label className="cursor-pointer">{category.name}</Label>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Brands */}
        {brands.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.slice(0, 10).map((brand: any) => {
                const isActive = currentBrand === brand.slug;
                return (
                  <Link
                    key={brand.id}
                    href={buildUrl({
                      ...searchParams,
                      brand: isActive ? undefined : brand.slug,
                    })}
                    className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Checkbox checked={isActive} />
                    <Label className="cursor-pointer">{brand.name}</Label>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="space-y-4">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[minPrice, maxPrice]}
              className="w-full"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">${minPrice}</span>
              <span>-</span>
              <span className="font-medium">${maxPrice}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="font-medium mb-3">Minimum Rating</h3>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => {
              const isActive = minRating >= rating;
              return (
                <Link
                  key={rating}
                  href={buildUrl({
                    ...searchParams,
                    minRating: isActive ? undefined : rating.toString(),
                  })}
                  className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Checkbox checked={isActive} />
                  <Label className="cursor-pointer flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-1">& up</span>
                  </Label>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="font-medium mb-3">Availability</h3>
          <div className="space-y-2">
            <Link
              href={buildUrl({
                ...searchParams,
                inStock: inStock ? undefined : 'true',
              })}
              className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Checkbox checked={inStock} />
              <Label className="cursor-pointer">In Stock</Label>
            </Link>
            <Link
              href={buildUrl({
                ...searchParams,
                hasVariants: hasVariants ? undefined : 'true',
              })}
              className="flex items-center gap-2 text-sm hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Checkbox checked={hasVariants} />
              <Label className="cursor-pointer">Has Variants</Label>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
