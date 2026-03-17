import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  HeadphonesIcon,
} from 'lucide-react';

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/public/products?sort=popularity&limit=8`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/categories`, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const featuredCategories = categories.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Discover Amazing Products
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
              Shop from thousands of sellers worldwide. Find unique products,
              great deals, and everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-lg font-medium transition-colors"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-lg font-medium transition-colors"
              >
                Browse Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  On orders over $50
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  100% protected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <HeadphonesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dedicated support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold">Best Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified sellers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Browse our wide selection of categories
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCategories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    {category.image ? (
                      <img
                        src={category.image.url}
                        alt={category.name}
                        className="w-16 h-16 mx-auto mb-3 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Handpicked products just for you
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium transition-colors"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group"
                >
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-white dark:bg-gray-900 flex items-center justify-center relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={
                            product.images.find((img: any) => img.isPrimary)
                              ?.url || product.images[0].url
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="h-16 w-16 text-gray-400" />
                      )}
                      {product.compareAtPrice &&
                        product.compareAtPrice > product.price && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Sale
                          </span>
                        )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      {product.shortDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice &&
                          product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                      </div>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({product.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-900 dark:to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of sellers on Vortex and reach customers worldwide.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-lg font-medium transition-colors"
          >
            Become a Seller
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
