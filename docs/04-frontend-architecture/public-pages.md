# Frontend Architecture - Public Pages

## Overview

The frontend is built with Next.js 14+ using App Router, Server Components, and Tailwind CSS. This document outlines the architecture of public-facing pages.

## Technology Stack

```typescript
// Core Framework
- Next.js 14+ (App Router)
- React 19
- TypeScript 5+

// Styling
- Tailwind CSS 4
- Radix UI (components)
- Lucide React (icons)
- next-themes (dark mode)

// State Management
- React Context API
- Server Actions (for mutations)
- URLSearchParams (for filters)

// Forms
- React Hook Form
- Zod (validation)

// Data Fetching
- Fetch API (native)
- Server Components (for data)
- SWR/React Query (for client data)

// UI Components
- shadcn/ui components
- Custom components
```

## Route Structure

```
web/src/app/
├── (auth)/                       # Auth routes group
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
│
├── (dashboard)/                  # Protected routes group
│   ├── buyer/
│   ├── seller/
│   └── system/
│
├── shop/                         # Public shop page
│   └── page.tsx
│
├── product/[slug]/               # Product detail page
│   └── page.tsx
│
├── brand/[slug]/                 # Brand page (future)
│   └── page.tsx
│
├── category/[slug]/              # Category page (future)
│   └── page.tsx
│
├── compare/                      # Product comparison
│   └── page.tsx
│
├── wishlist/                     # Wishlist (future)
│   └── page.tsx
│
├── search/                       # Search results (future)
│   └── page.tsx
│
├── cart/                         # Shopping cart (future)
│   └── page.tsx
│
├── checkout/                     # Checkout (future)
│   └── page.tsx
│
├── page.tsx                      # Landing page
├── layout.tsx                    # Root layout
├── robots.ts                     # SEO: robots.txt
└── sitemap.ts                    # SEO: sitemap.xml
```

## Page Architecture

### Landing Page (`/`)

```typescript
// Server Component - Data Fetching
async function HomePage() {
  // Server-side data fetching
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories()
  ]);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FeaturedCategories categories={categories} />
      <FeaturedProducts products={products} />
      <CTASection />
    </>
  );
}
```

### Shop Page (`/shop`)

```typescript
// Server Component with Search Params
interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  return (
    <div className="container">
      <aside>
        <Suspense fallback={<FiltersSkeleton />}>
          <ProductFilters searchParams={params} />
        </Suspense>
      </aside>
      <main>
        <Suspense fallback={<SortSkeleton />}>
          <ProductSort searchParams={params} />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={params} />
        </Suspense>
      </main>
    </div>
  );
}
```

### Product Detail Page (`/product/[slug]`)

```typescript
// Server Component with Dynamic Metadata
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.map(img => img.url),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return (
    <ProductLayout>
      <ProductGallery images={product.images} />
      <ProductInfo product={product} />
      <ProductTabs product={product} />
    </ProductLayout>
  );
}
```

## Component Architecture

### Component Hierarchy

```
┌─────────────────────────────────────┐
│         Root Layout                  │
│  ┌───────────────────────────────┐  │
│  │      Navbar (Global)           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     Page Content              │  │
│  │  ┌─────────┐  ┌───────────┐   │  │
│  │  │Sidebar │  │ Main      │   │  │
│  │  │Filters │  │ Content   │   │  │
│  │  └─────────┘  └───────────┘   │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      Footer (Global)           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Server vs Client Components

```typescript
// Server Components (default)
// - Fetch data directly
// - No interactivity
// - Better SEO
// - Faster initial load

async function ProductGrid({ searchParams }: Props) {
  const products = await getProducts(searchParams);

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// Client Components ('use client')
// - Interactive features
// - useState, useEffect
// - Event handlers
'use client';

function ProductFilters({ filters }: Props) {
  const [selected, setSelected] = useState({});

  return (
    <div>
      <Filter onChange={(v) => setSelected(v)} />
    </div>
  );
}
```

## Data Fetching Patterns

### Server Component Fetching

```typescript
// Direct API calls in Server Components
async function getProducts(params: SearchParams) {
  const baseUrl = process.env.API_URL;
  const response = await fetch(`${baseUrl}/api/public/products?${params}`, {
    next: { revalidate: 60 }, // ISR: 60 seconds
  });

  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

### Client Component Fetching

```typescript
// Use SWR or React Query in Client Components
'use client';

import useSWR from 'swr';

function ProductList() {
  const { data, error, isLoading } = useSWR(
    '/api/public/products',
    fetcher
  );

  if (isLoading) return <Skeleton />;
  if (error) return <Error />;

  return <Grid products={data} />;
}
```

## State Management

### URL State (for Filters)

```typescript
// Use URL params for filters/sorting
const searchParams = useSearchParams();
const router = useRouter();

function updateFilter(key: string, value: string) {
  const params = new URLSearchParams(searchParams);
  params.set(key, value);
  router.push(`?${params.toString()}`);
}

// Benefits:
// - Shareable URLs
// - Browser back button works
// - Server rendering support
```

### Local State (for Interactions)

```typescript
// Use React state for UI interactions
'use client';

function ProductInfo({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  return (
    <>
      <QuantitySelector value={quantity} onChange={setQuantity} />
      <VariantSelector
        variants={product.variants}
        selected={selectedVariant}
        onSelect={setSelectedVariant}
      />
    </>
  );
}
```

## Styling Architecture

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... more colors
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Component Styling Pattern

```typescript
// Use utility classes with cn() for conditional classes
import { cn } from '@/lib/utils';

function Button({ variant, size, className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90':
            variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90':
            variant === 'destructive',
          'border border-input bg-background hover:bg-accent':
            variant === 'outline',
        },
        {
          'h-10 px-4 py-2': size === 'default',
          'h-9 px-3 rounded-md': size === 'sm',
          'h-11 px-8 rounded-md': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

## Performance Optimization

### Static Generation (SSG)

```typescript
// Generate static pages at build time
export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}
```

### Incremental Static Regeneration (ISR)

```typescript
// Revalidate pages in the background
async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/products/${slug}`, {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  return res.json();
}
```

### Image Optimization

```typescript
import Image from 'next/image';

// Use Next.js Image for optimization
<img
  src={product.image}
  alt={product.name}
  width={500}
  height={500}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### Lazy Loading

```typescript
// Lazy load components below the fold
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false
  }
);
```

## Responsive Design

### Mobile-First Approach

```typescript
<div className="
  grid
  grid-cols-1              // Mobile: 1 column
  sm:grid-cols-2          // Tablet: 2 columns
  md:grid-cols-3          // Desktop: 3 columns
  lg:grid-cols-4          // Large: 4 columns
  gap-4                  // Spacing
">
  {products.map(p => <ProductCard product={p} />)}
</div>
```

### Breakpoints

```typescript
// Tailwind default breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Usage
<div className="
  flex
  flex-col              // Mobile: column
  md:flex-row           // Desktop+: row
  gap-4
  md:gap-8              // More gap on desktop
">
  <Sidebar />
  <Main />
</div>
```

## Accessibility

### Semantic HTML

```typescript
// Use proper semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/shop">Shop</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <h1>Products</h1>
  <article aria-label="Product card">
    <h2>Product Name</h2>
    <p>Description</p>
  </article>
</main>
```

### ARIA Labels

```typescript
<button
  aria-label="Add to cart"
  aria-pressed={isAdded}
>
  <ShoppingCart aria-hidden="true" />
</button>

<input
  type="search"
  aria-label="Search products"
  placeholder="Search..."
/>
```

### Keyboard Navigation

```typescript
// Ensure all interactive elements are keyboard accessible
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

## Error Handling

### Error Boundaries

```typescript
'use client';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Error Pages

```typescript
// app/error.tsx (for errors in App Router)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Page not found</h2>
      <Link href="/">Go home</Link>
    </div>
  );
}
```

## Testing Strategy

### Unit Tests

```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

test('renders product name', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Product Name')).toBeInTheDocument();
});
```

### E2E Tests

```typescript
// Playwright E2E tests
test('user can browse products', async ({ page }) => {
  await page.goto('/shop');
  await page.click('text=Electronics');
  await expect(page).toHaveURL(/category=electronics/);
});
```

## Build & Deployment

### Build Configuration

```typescript
// next.config.js
const nextConfig = {
  output: 'standalone', // For Docker
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Production Build

```bash
# Build
npm run build

# Start production server
npm start

# Or use standalone output
node .next/standalone/server.js
```
