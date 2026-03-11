'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, cartApi } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Search } from 'lucide-react';

export default function ShopPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category],
    queryFn: async () => {
      const res = await productApi.list({
        search: search || undefined,
        category: category || undefined,
      });
      return res.data as Product[];
    },
  });

  const addToCart = useMutation({
    mutationFn: (productId: string) => cartApi.add({ productId, quantity: 1 }),
    onSuccess: (_, productId) => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 1500);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shop</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2.5 top-2.5 text-muted-foreground"
            />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-md border bg-transparent text-sm w-56 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-md border bg-transparent text-sm w-36 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading...
        </div>
      ) : !data?.length ? (
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
              <button
                onClick={() => addToCart.mutate(product._id)}
                disabled={product.stock === 0 || addedId === product._id}
                className="w-full rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {addedId === product._id
                  ? 'Added!'
                  : product.stock === 0
                    ? 'Out of stock'
                    : 'Add to cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
