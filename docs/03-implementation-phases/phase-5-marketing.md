# Phase 5: Marketing & SEO

## Overview

Phase 5 implements marketing features including promotions, discounts, coupon codes, and comprehensive SEO optimization with sitemaps, structured data, and analytics integration.

## Objectives

- [ ] Create Promotion/Discount microservice
- [ ] Implement coupon code system
- [ ] Build product promotion management
- [ ] Add SEO optimization (sitemap, robots.txt, meta tags)
- [ ] Implement structured data (schema.org)
- [ ] Add analytics tracking integration
- [ ] Create marketing email templates

## Database Schema

### Promotion Schema

```typescript
interface IPromotion {
  _id: string;
  name: string;
  description?: string;
  type:
    | 'percentage'
    | 'fixed'
    | 'free_shipping'
    | 'buy_x_get_y'
    | 'bundled_discount';

  // Discount Details
  value: number; // Percentage or fixed amount
  appliesTo: 'all' | 'products' | 'categories' | 'brands' | 'collections';
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  collectionIds?: string[];

  // Conditions
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  requireCoupon: boolean;
  couponCode?: string; // Unique coupon code
  couponUses?: number; // Track usage
  couponMaxUses?: number; // Usage limit

  // Targeting
  customerGroups: 'all' | 'new' | 'returning' | 'vip' | 'b2b';
  userSegmentIds?: string[];
  excludeSaleItems?: boolean;

  // Buy X Get Y Details
  buyXGetY?: {
    buyQuantity: number;
    getQuantity: number;
    getProducts?: string[]; // Specific products, or "any"
    maxFreeItems?: number;
    discountPercent?: number; // For "buy X get Y % off"
  };

  // Bundled Discount Details
  bundledDiscount?: {
    requiredProductIds: string[]; // Must buy all
    discountPercent: number;
  };

  // Validity
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Usage Limits
  usageLimit?: number; // Total uses across all users
  usageCount: number;
  perUserLimit?: number; // Max uses per user

  // Priority (for stacking)
  priority: number; // Higher = applied first
  stackable: boolean; // Can combine with other promotions

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

**Indexes:**

```javascript
promotionSchema.index({ couponCode: 1 }, { unique: true, sparse: true });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ appliesTo: 1 });
```

### Usage Tracking Schema

```typescript
interface IPromotionUsage {
  _id: string;
  promotionId: string;
  userId?: string;
  orderId: string;
  discountAmount: number;
  currency: string;
  usedAt: Date;

  // Context
  orderSubtotal: number;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
```

### Collection Schema (for grouping products)

```typescript
interface ICollection {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  // Collection Type
  type: 'manual' | 'automated' | 'smart';

  // Manual Collection
  productIds?: string[];

  // Automated Collection Rules
  rules?: ICollectionRules[];

  // Display
  image?: string;
  banner?: string;
  metaTitle?: string;
  metaDescription?: string;

  // Settings
  isActive: boolean;
  displayOrder: number;
  publishAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface ICollectionRules {
  field: 'category' | 'brand' | 'tag' | 'price' | 'stock' | 'rating';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}
```

## API Design

### Promotion Endpoints

```typescript
// Public (validation only)
POST   /api/promotions/validate       # Validate coupon code
GET    /api/promotions/active         # Get active promotions

// Seller/Admin
GET    /api/promotions                # List promotions
POST   /api/promotions                # Create promotion
GET    /api/promotions/:id            # Get promotion
PUT    /api/promotions/:id            # Update promotion
DELETE /api/promotions/:id            # Delete promotion
POST   /api/promotions/:id/activate   # Activate promotion
POST   /api/promotions/:id/deactivate # Deactivate promotion

// Coupon Management
GET    /api/promotions/coupons        # List all coupon codes
POST   /api/promotions/generate-codes # Generate bulk codes
GET    /api/promotions/:id/usage      # Usage statistics

// Collections
GET    /api/collections               # List collections
POST   /api/collections               # Create collection
GET    /api/collections/:slug         # Get collection (public)
PUT    /api/collections/:id           # Update collection
DELETE /api/collections/:id           # Delete collection
POST   /api/collections/:id/products  # Add products (manual)
DELETE /api/collections/:id/products  # Remove products
```

### Cart/Promotion Integration

```typescript
// Apply promotion to cart
POST   /api/cart/promotions
Body: {
  couponCode?: string;
}

// Response: {
//   cart: ICart;
//   appliedPromotions: Array<{
//     promotionId: string;
//     name: string;
//     discountAmount: number;
//   }>;
//   errors?: string[];
// }
```

## SEO Implementation

### Sitemap Generation

```typescript
// web/app/sitemap.ts (Next.js 13+)
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vortex.com';

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
  ];

  // Dynamic routes - Products
  const products = await fetch(`${baseUrl}/api/public/products?limit=50000`)
    .then((res) => res.json())
    .then((data) => data.data.products || []);

  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic routes - Categories
  const categories = await fetch(`${baseUrl}/api/public/categories`)
    .then((res) => res.json())
    .then((data) => data.data || []);

  const categoryRoutes = categories.map((category: any) => ({
    url: `${baseUrl}/shop?category=${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic routes - Brands
  const brands = await fetch(`${baseUrl}/api/public/brands`)
    .then((res) => res.json())
    .then((data) => data.data || []);

  const brandRoutes = brands.map((brand: any) => ({
    url: `${baseUrl}/shop?brand=${brand.slug}`,
    lastModified: new Date(brand.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}
```

### Robots.txt

```typescript
// web/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/admin',
          '/cart',
          '/checkout',
          '/profile',
        ],
      },
    ],
    sitemap: 'https://vortex.com/sitemap.xml',
  };
}
```

### Structured Data (Schema.org)

```typescript
// Product structured data
function generateProductStructuredData(product: IProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images.map((img) => img.url),
    brand: {
      '@type': 'Brand',
      name: product.brand?.name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://vortex.com/product/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      priceValidUntil: product.compareAtPrice
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Vortex',
      },
    },
    aggregateRating:
      product.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

// Breadcrumb structured data
function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Organization structured data (for homepage)
const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Vortex',
  url: 'https://vortex.com',
  logo: 'https://vortex.com/logo.png',
  sameAs: [
    'https://twitter.com/vortex',
    'https://facebook.com/vortex',
    'https://instagram.com/vortex',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-800-VORTEX',
    contactType: 'Customer Service',
    availableLanguage: 'English',
  },
};
```

### Meta Tags Enhancement

```typescript
// web/src/lib/seo.ts
interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  product?: IProduct;
}

export function generateMetadata(props: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vortex.com';
  const url = props.url || baseUrl;
  const image = props.image || `${baseUrl}/og-image.png`;

  return {
    title: props.title,
    description: props.description,
    openGraph: {
      title: props.title,
      description: props.description,
      url,
      siteName: 'Vortex',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: props.title,
        },
      ],
      locale: 'en_US',
      type: props.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: props.title,
      description: props.description,
      images: [image],
    },
    ...(props.product && {
      product: {
        name: props.product.name,
        description: props.product.shortDescription,
        images: props.product.images.map((img) => img.url),
        offers: {
          price: props.product.price,
          currency: props.product.currency,
          availability: props.product.stock > 0 ? 'InStock' : 'OutOfStock',
        },
      },
    }),
    alternates: {
      canonical: url,
    },
  };
}
```

## Frontend Components

### Promotion Management

```
web/src/app/(dashboard)/system/promotions/
├── page.tsx                      # Promotions list
├── new/page.tsx                  # Create promotion
├── [id]/page.tsx                 # Edit promotion
├── [id]/usage/page.tsx           # Usage statistics
└── components/
    ├── PromotionForm.tsx         # Create/edit form
    ├── PromotionRules.tsx        # Rule builder
    ├── CouponGenerator.tsx       # Generate bulk codes
    ├── UsageChart.tsx            # Usage analytics
    └── PromotionPreview.tsx      # Preview promotion
```

**PromotionForm Component:**

```typescript
interface PromotionFormProps {
  promotion?: IPromotion;
  onSubmit: (promotion: IPromotion) => void;
}

// Sections:
// - Basic info (name, description, type)
// - Discount details (value, max discount)
// - Applicability (products, categories, brands)
// - Conditions (min order, customer group)
// - Coupon settings (code, usage limits)
// - Validity period
// - Priority & stacking
// - Preview
```

### Collection Management

```
web/src/app/(dashboard)/system/collections/
├── page.tsx                      # Collections list
├── new/page.tsx                  # Create collection
├── [id]/page.tsx                 # Edit collection
└── components/
    ├── CollectionForm.tsx        # Create/edit form
    ├── RuleBuilder.tsx           # Build automation rules
    ├── ProductPicker.tsx         # Manual product selection
    └── CollectionPreview.tsx     # Preview collection
```

### Cart with Promotions

```
web/src/app/(dashboard)/buyer/cart/
├── page.tsx                      # Cart page
└── components/
    ├── CartItems.tsx             # Cart items list
    ├── CartSummary.tsx           # Subtotal, discounts, total
    ├── CouponInput.tsx           # Apply coupon code
    ├── AppliedPromotions.tsx     # Show applied discounts
    └── SavingsHighlight.tsx      # Show total savings
```

**CouponInput Component:**

```typescript
interface CouponInputProps {
  onApply: (code: string) => Promise<{ success: boolean; message?: string }>;
  appliedCoupon?: string;
  onRemove?: () => void;
}

// Features:
// - Input field for code
// - Apply button
// - Show success/error messages
// - Show applied coupon with remove option
// - Display discount amount
```

## Analytics Integration

### Event Tracking

```typescript
// web/src/lib/analytics.ts
export const analyticsEvents = {
  // Product events
  productView: (productId: string, price: number) => ({
    event: 'view_item',
    ecommerce: {
      items: [
        {
          item_id: productId,
          price,
        },
      ],
    },
  }),

  addToCart: (productId: string, quantity: number, price: number) => ({
    event: 'add_to_cart',
    ecommerce: {
      items: [
        {
          item_id: productId,
          quantity,
          price,
        },
      ],
    },
  }),

  search: (query: string, resultCount: number) => ({
    event: 'search',
    search_term: query,
    results_count: resultCount,
  }),

  couponApplied: (couponCode: string, discountAmount: number) => ({
    event: 'apply_coupon',
    coupon_code: couponCode,
    discount_amount: discountAmount,
  }),

  purchase: (orderId: string, total: number, items: any[]) => ({
    event: 'purchase',
    ecommerce: {
      transaction_id: orderId,
      value: total,
      items: items,
    },
  }),
};

// Integration with:
// - Google Analytics 4
// - Facebook Pixel
// - Google Ads Conversion Tracking
// - TikTok Pixel
// - Custom analytics
```

### Marketing Dashboard

```
web/src/app/(dashboard)/system/analytics/
├── page.tsx                      # Analytics overview
├── promotions/page.tsx           # Promotion performance
└── components/
    ├── TrafficChart.tsx          # Visitors over time
    ├── SalesChart.tsx            # Revenue over time
    ├── ConversionRate.tsx        # Conversion metrics
    ├── TopProducts.tsx           # Best-selling products
    ├── PromotionPerformance.tsx  # Promotion ROI
    └── CouponUsage.tsx           # Coupon redemption stats
```

## Email Marketing Templates

### Promotion Emails

```typescript
// templates/emails/promotion.tsx
interface PromotionEmailProps {
  promotionName: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  couponCode?: string;
  validUntil: Date;
  products?: Array<{
    name: string;
    image: string;
    url: string;
    price: number;
  }>;
}

// Email sections:
// - Hero banner with promotion
// - Discount amount display
// - Coupon code (if applicable)
// - Featured products
// - Terms and conditions
// - Unsubscribe link
```

## Implementation Steps

### Step 1: Promotion Service (Week 1)

1. **Create Promotion Microservice**
   - `/services/promotion-service/`
   - Database: `vortex-promotions`
   - Promotion and Collection models

2. **Basic CRUD**
   - Create, read, update, delete promotions
   - Generate coupon codes
   - Validate coupons

### Step 2: Promotion Logic (Week 1-2)

1. **Discount Calculation Engine**
   - Percentage discounts
   - Fixed amount discounts
   - Free shipping
   - Buy X Get Y
   - Bundled discounts

2. **Stacking Rules**
   - Priority-based application
   - Stackable vs exclusive
   - Maximum discount limits

### Step 3: Cart Integration (Week 2)

1. **Apply Promotions**
   - Coupon code input
   - Auto-applied promotions
   - Display savings

2. **Validation**
   - Check eligibility
   - Validate dates
   - Check usage limits

### Step 4: SEO Implementation (Week 2-3)

1. **Sitemap Generation**
   - Dynamic sitemap
   - Include all products, categories, brands
   - Regenerate on changes

2. **Structured Data**
   - Product schema
   - Organization schema
   - Breadcrumb schema
   - Review schema

3. **Meta Tags**
   - Open Graph tags
   - Twitter Card tags
   - Canonical URLs

### Step 5: Analytics (Week 3)

1. **Event Tracking**
   - Page views
   - Product views
   - Add to cart
   - Coupon applied
   - Purchases

2. **Integration**
   - Google Analytics
   - Facebook Pixel
   - Google Ads

### Step 6: Management UI (Week 3-4)

1. **Promotion Dashboard**
   - Create promotions
   - View usage stats
   - Generate coupon codes

2. **Collection Manager**
   - Create collections
   - Build automation rules
   - Preview products

## Success Criteria

### Backend

- ✅ Promotions can be created
- ✅ Coupon codes are validated
- ✅ Discounts calculate correctly
- ✅ Usage is tracked
- ✅ Sitemap generates

### Frontend

- ✅ Coupons can be applied
- ✅ Savings display correctly
- ✅ Promotion manager works
- ✅ Collection builder works

### SEO

- ✅ Sitemap is valid
- ✅ Structured data is correct
- ✅ Meta tags are present
- ✅ Robots.txt is configured

### Analytics

- ✅ Events are tracked
- ✅ Data flows to GA
- ✅ Conversion tracking works
- ✅ ROI can be measured

## File Structure

### Backend

```
services/promotion-service/
├── src/
│   ├── models/
│   │   ├── Promotion.ts
│   │   ├── Collection.ts
│   │   └── PromotionUsage.ts
│   ├── routes/
│   │   ├── promotion.routes.ts
│   │   ├── collection.routes.ts
│   │   └── public.routes.ts
│   ├── controllers/
│   │   ├── promotion.controller.ts
│   │   ├── collection.controller.ts
│   │   └── discount.controller.ts
│   ├── services/
│   │   ├── promotion.service.ts
│   │   ├── discount.service.ts
│   │   ├── coupon.service.ts
│   │   └── collection.service.ts
│   └── utils/
│       ├── discount-calculator.ts
│       └── coupon-generator.ts
└── package.json
```

### Frontend

```
web/src/
├── app/
│   ├── sitemap.ts
│   ├── robots.ts
│   └── (dashboard)/system/
│       ├── promotions/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── collections/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       └── analytics/
│           └── page.tsx
│
├── components/
│   ├── promotions/
│   │   ├── CouponInput.tsx
│   │   ├── AppliedPromotions.tsx
│   │   └── PromotionCard.tsx
│   └── collections/
│       └── CollectionGrid.tsx
│
└── lib/
    ├── seo.ts
    ├── analytics.ts
    └── structured-data.ts
```

## Testing Checklist

### Promotions

- [ ] Create percentage discount
- [ ] Create fixed amount discount
- [ ] Create free shipping promotion
- [ ] Create buy X get Y
- [ ] Generate coupon codes
- [ ] Validate coupon code
- [ ] Apply coupon to cart
- [ ] Coupon expires after end date
- [ ] Usage limit enforced
- [ ] Per-user limit enforced

### Collections

- [ ] Create manual collection
- [ ] Create automated collection
- [ ] Rules work correctly
- [ ] Collection updates dynamically
- [ ] Collection page displays

### SEO

- [ ] Sitemap generates
- [ ] Sitemap includes all products
- [ ] Structured data is valid
- [ ] Meta tags are present
- [ ] Open Graph tags work
- [ ] Canonical URLs are set

### Analytics

- [ ] Page views tracked
- [ ] Product views tracked
- [ ] Add to cart tracked
- [ ] Coupon application tracked
- [ ] Purchase tracked
- [ ] Data appears in GA

## Next Phase

After completing Phase 5, proceed to **Phase 6: Seller Tools** (final phase).
