import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    rating: number;
    reviewCount: number;
    images: {
      url: string;
      alt: string;
      isPrimary: boolean;
    }[];
    stock: number;
    allowBackorder?: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          {/* Image */}
          <div className="aspect-square relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {discountPercent}% OFF
                </span>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Low Stock
                </span>
              )}
              {product.stock === 0 && !product.allowBackorder && (
                <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to wishlist
              }}
            >
              <Heart className="h-4 w-4" />
            </button>

            {/* Quick Add */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                className="w-full"
                size="sm"
                disabled={product.stock === 0}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add to cart
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[2.5rem]">
              {product.name}
            </h3>

            {product.shortDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {product.shortDescription}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-xl">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="text-xs text-red-500 font-semibold">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
