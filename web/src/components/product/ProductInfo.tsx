'use client';

import { useState } from 'react';
import { Star, Truck, Shield, RotateCcw, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface ProductInfoProps {
  product: {
    name: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    rating: number;
    reviewCount: number;
    stock: number;
    allowBackorder: boolean;
    images: any[];
    hasVariants: boolean;
    variants?: any[];
    brand?: any;
    primaryCategory?: any;
    attributes?: any[];
    tags?: string[];
    freeShipping: boolean;
    requiresShipping: boolean;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  const canAddToCart = product.stock > 0 || product.allowBackorder;
  const stockStatus =
    product.allowBackorder && product.stock === 0
      ? 'Available on backorder'
      : product.stock > 5
        ? 'In Stock'
        : product.stock > 0
          ? `Only ${product.stock} left in stock`
          : 'Out of Stock';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {product.primaryCategory && (
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <span>Shop</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">
            {product.primaryCategory.name}
          </span>
        </nav>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {/* Rating */}
      {product.rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{product.rating.toFixed(1)}</span>
          <a href="#reviews" className="text-blue-600 hover:underline">
            ({product.reviewCount} reviews)
          </a>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
        {hasDiscount && (
          <>
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
            <Badge variant="destructive">{discountPercent}% OFF</Badge>
          </>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-gray-600 dark:text-gray-400">
          {product.shortDescription}
        </p>
      )}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <span
          className={`font-medium ${
            product.stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {stockStatus}
        </span>
      </div>

      {/* Variants */}
      {product.hasVariants &&
        product.variants &&
        product.variants.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Option
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium mb-2 block">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={product.stock <= quantity}
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="flex-1"
          disabled={!canAddToCart}
          onClick={() => {
            // TODO: Add to cart
            console.log('Add to cart', { quantity, variant: selectedVariant });
          }}
        >
          Add to Cart
        </Button>
        <Button size="lg" variant="outline">
          <Heart className="mr-2 h-5 w-5" />
          Wishlist
        </Button>
        <Button size="lg" variant="outline">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium">Free Shipping</p>
            <p className="text-gray-600 dark:text-gray-400">
              On orders over $50
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium">Secure Payment</p>
            <p className="text-gray-600 dark:text-gray-400">100% protected</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <RotateCcw className="h-5 w-5 text-purple-600" />
          <div>
            <p className="font-medium">Easy Returns</p>
            <p className="text-gray-600 dark:text-gray-400">30-day returns</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
