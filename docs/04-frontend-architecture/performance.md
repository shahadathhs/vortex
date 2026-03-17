# Frontend Performance Optimization

## Overview

Performance strategies for the Vortex frontend including caching, lazy loading, code splitting, and server-side rendering.

## Caching Strategies

### Static Generation (SSG)

```typescript
// Generate static pages at build time
// Good for: Homepage, Category pages, Product pages (mostly static)

// web/src/app/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const products = await getFeaturedProducts();
  return <FeaturedProducts products={products} />;
}
```

### Incremental Static Regeneration (ISR)

```typescript
// Serve static content, update in background
// Good for: Product listings, category pages

// web/src/app/shop/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ShopPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

### On-Demand Revalidation

```typescript
// Revalidate page when data changes
// Triggered by backend events

import { revalidatePath } from 'next/cache';

// When product is updated
export async function POST(request: Request) {
  const { productId } = await request.json();

  await updateProduct(productId);

  // Revalidate product page
  revalidatePath(`/product/${slug}`);

  // Revalidate shop page
  revalidatePath('/shop');

  return Response.json({ success: true });
}
```

### Client-Side Caching

```typescript
// Use SWR for client data fetching
'use client';

import useSWR from 'swr';

function Cart() {
  const { data, error, isLoading } = useSWR(
    '/api/cart',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Don't refetch within 5 seconds
    }
  );

  return <CartDisplay cart={data} />;
}
```

## Code Splitting

### Route-Based Splitting

```typescript
// Automatic with Next.js App Router
// Each page is automatically code-split

// shop/page.tsx → Separate chunk
// product/[slug]/page.tsx → Separate chunk
// dashboard/page.tsx → Separate chunk
```

### Component Lazy Loading

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(
  () => import('./components/HeavyChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Don't render on server
  }
);

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <HeavyChart />
    </div>
  );
}
```

### Conditional Loading

```typescript
// Load components based on user role
import dynamic from 'next/dynamic';

const SellerDashboard = dynamic(
  () => import('./components/SellerDashboard')
);

const BuyerDashboard = dynamic(
  () => import('./components/BuyerDashboard')
);

export default function Dashboard({ user }: Props) {
  return (
    <div>
      {user.role === 'seller' ? <SellerDashboard /> : <BuyerDashboard />}
    </div>
  );
}
```

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

// Optimized image loading
<img
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  priority={isAboveFold}              // Load above-fold images immediately
  placeholder="blur"                  // Blur placeholder
  blurDataURL="data:image/jpeg;base64,..."
  loading="lazy"                     // Lazy load below-fold
/>
```

### Responsive Images

```typescript
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  // Generates:
  // - 640w for mobile
  // - 1024w for tablet
  // - 1920w for desktop
/>
```

### Image CDN

```typescript
// Use Cloudinary for optimization
const optimizedUrl = cloudinary.url(product.image).transformation({
  quality: 'auto',
  fetch_format: 'auto',
  width: 400,
  height: 400,
  crop: 'fill',
});
```

## Lazy Loading

### Component Lazy Loading

```typescript
// Intersection Observer for component lazy loading
'use client';

import { useEffect, useRef, useState } from 'react';

function LazyComponent({ children, threshold = 0.1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return <div ref={ref}>{isVisible ? children : <Skeleton />}</div>;
}
```

### Infinite Scroll

```typescript
'use client';

import { useEffect, useRef } from 'react';

function InfiniteScroll({ loadMore, hasMore }) {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return <div ref={loaderRef} />;
}
```

## Data Fetching Optimization

### Parallel Data Fetching

```typescript
// Fetch data in parallel
export default async function ProductPage({ params }: Props) {
  const [product, relatedProducts, reviews] = await Promise.all([
    getProduct(params.slug),
    getRelatedProducts(params.slug),
    getReviews(params.slug)
  ]);

  return (
    <ProductLayout>
      <ProductInfo product={product} />
      <RelatedProducts products={relatedProducts} />
      <Reviews reviews={reviews} />
    </ProductLayout>
  );
}
```

### Prefetching Data

```typescript
// Prefetch data on hover
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

function ProductCard({ product }: Props) {
  const router = useRouter();
  const prefetch = useSWRMutation('/api/products/related', fetchRelated);

  return (
    <Link
      href={`/product/${product.slug}`}
      onMouseEnter={() => prefetch.trigger(product.id)}
    >
      <ProductCardContent product={product} />
    </Link>
  );
}
```

### Request Deduplication

```typescript
// SWR automatically deduplicates requests
// Even if component mounts multiple times

// All three hooks share the same request
const { data: cart1 } = useSWR('/api/cart');
const { data: cart2 } = useSWR('/api/cart');
const { data: cart3 } = useSWR('/api/cart');
// Only 1 network request is made
```

## Bundle Optimization

### Tree Shaking

```typescript
// Import only what you need
// Bad:
import * as _ from 'lodash';

// Good:
import debounce from 'lodash/debounce';
import { throttle } from 'lodash-es';

// Or use specialized libraries
import { clsx } from 'clsx'; // Smaller than classnames
import { debounce } from 'radash'; // Smaller than lodash
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build

# Output:
# Route (app)                              Size      First Load JS
# ┌ ○ /                                    230 B          81.6 kB
# ├ ○ /shop                                 1.2 kB         82.5 kB
# ├ ○ /product/[slug]                       2.1 kB         83.4 kB
# └ ○ /dashboard                            15.2 kB        96.5 kB
```

### Dynamic Imports

```typescript
// Import heavy libraries only when needed
const Chart = dynamic(() => import('chart.js/auto'), {
  ssr: false,
});

// Conditional import
const Editor = process.env.features.richText
  ? dynamic(() => import('./Editor'))
  : () => <textarea />;
```

## Rendering Optimization

### Server Components

```typescript
// Default: Server Component (no 'use client')
// Better for:
// - Data fetching
// - SEO
// - Initial page load

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

### Client Components

```typescript
'use client';

// Only for:
// - Interactivity (useState, useEffect)
// - Event handlers
// - Browser APIs
// - Third-party libraries that need window

export function ProductFilters() {
  const [price, setPrice] = useState([0, 100]);

  return <RangeSlider value={price} onChange={setPrice} />;
}
```

### Mixed Strategy

```typescript
// Server Component (parent)
export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);

  return (
    <>
      <ProductGallery images={product.images} />
      {/* Client Component for interactivity */}
      <AddToCart productId={product.id} />
    </>
  );
}
```

## Font Optimization

### next/font

```typescript
// web/src/app/layout.tsx
import { Inter, Roboto } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({ children }: Props) {
  return (
    <html className={`${inter.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Subsetting

```typescript
// Only load needed characters
const inter = Inter({
  subsets: ['latin'],
  // Or specific Unicode ranges
  subsets: [
    {
      name: 'latin',
      unicodeRange: {
        // U+0000-007F: Basic Latin
        // U+0080-00FF: Latin-1 Supplement
      },
    },
  ],
});
```

## Network Optimization

### HTTP/2 & HTTP/3

```typescript
// Next.js automatically uses HTTP/2
// Benefits:
// - Multiplexing (multiple requests over one connection)
// - Server push (push critical resources)
// - Header compression

// Enable HTTP/3 in next.config.js
module.exports = {
  experimental: {
    http3: true,
  },
};
```

### Compression

```typescript
// Enable gzip/brotli compression
// next.config.js
module.exports = {
  compress: true, // Enable gzip compression
};
```

### CDN Configuration

```typescript
// Configure CDN for static assets
// next.config.js
module.exports = {
  assetPrefix: process.env.CDN_URL,
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
};
```

## Performance Monitoring

### Web Vitals

```typescript
// web/src/app/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric);

    // Example: Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value,
        ),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

### Performance Budgets

```typescript
// .eslintrc.js
module.exports = {
  rules: {
    'next/inline-script-id': 'error',
    'next/no-page-custom-font': 'warn',
    'next/no-sync-scripts': 'error',
  },
};
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/shop
            http://localhost:3000/product/sample-product
          uploadArtifacts: true
```

## Target Metrics

### Core Web Vitals Targets

```
Largest Contentful Paint (LCP): < 2.5s
First Input Delay (FID): < 100ms
Cumulative Layout Shift (CLS): < 0.1
First Contentful Paint (FCP): < 1.8s
Time to Interactive (TTI): < 3.8s
Total Blocking Time (TBT): < 200ms
Speed Index: < 3.4s
```

### Performance Budgets

```
Initial JavaScript: < 200 KB gzipped
Initial CSS: < 50 KB gzipped
Initial HTML: < 15 KB gzipped
Total Page Weight: < 2 MB
Number of Requests: < 50
DOM Nodes: < 1500
```

## Optimization Checklist

### Images

- [ ] All images use Next.js Image component
- [ ] Images have proper width/height
- [ ] Above-fold images have priority
- [ ] Use WebP format when possible
- [ ] Implement lazy loading for below-fold
- [ ] Use blur placeholders for better UX
- [ ] Optimize images via CDN (Cloudinary)

### Code

- [ ] Minimize JavaScript bundle size
- [ ] Use tree shaking
- [ ] Code split by route
- [ ] Lazy load heavy components
- [ ] Remove unused dependencies
- [ ] Minimize CSS
- [ ] Use CSS modules or styled-components

### Data

- [ ] Implement server-side caching
- [ ] Use ISR for dynamic content
- [ ] Revalidate data intelligently
- [ ] Deduplicate requests
- [ ] Prefetch data on hover
- [ ] Use Edge Runtime for global content

### Rendering

- [ ] Use Server Components by default
- [ ] Minimize Client Components
- [ ] Implement streaming SSR
- [ ] Optimize component re-renders
- [ ] Use React.memo where appropriate
- [ ] Implement virtualization for long lists

```

```
