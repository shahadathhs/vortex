# Product Schema Design

## Overview

The Product schema has been significantly enhanced to support a full-featured e-commerce platform with images, variants, reviews, SEO, and inventory management.

## Complete Schema

```typescript
interface IProduct {
  // Basic Info
  _id: string;
  name: string;
  slug: string; // SEO-friendly URL
  description: string;
  shortDescription?: string; // For listing pages (max 160 chars)

  // Seller Info
  sellerId: string;
  storeId?: string; // For multi-store sellers

  // Pricing
  price: number;
  compareAtPrice?: number; // Original price (for sales display)
  costPrice?: number; // Seller's cost (for margin calc - seller only)
  currency: string; // Default: USD

  // Inventory
  stock: number;
  lowStockThreshold?: number; // Alert when below this (default: 10)
  allowBackorder: boolean; // Allow ordering when out of stock
  trackInventory: boolean; // Whether to track stock

  // Product Status
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
  publishedAt?: Date;

  // SEO
  metaTitle?: string; // Default: name
  metaDescription?: string; // Default: shortDescription
  metaKeywords?: string[];

  // Media
  images: IProductImage[];
  videos?: IProductVideo[];

  // Categories & Organization
  categoryIds: string[]; // Multiple categories allowed
  primaryCategoryId: string; // Main category for breadcrumbs
  tags: string[]; // For search and filtering
  brandId?: string;

  // Variants
  hasVariants: boolean;
  variantType: 'none' | 'size' | 'color' | 'size_color' | 'custom';
  variants?: IVariant[];

  // Attributes (custom fields like Material, Warranty, etc.)
  attributes: IProductAttribute[];

  // Shipping
  weight?: number; // in grams
  length?: number; // in cm
  width?: number;
  height?: number;
  requiresShipping: boolean;
  freeShipping: boolean;

  // Taxes
  taxClassId?: string;
  taxable: boolean;

  // Reviews & Ratings (aggregated)
  rating: number; // Average rating (0-5)
  reviewCount: number;

  // Analytics
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;

  // B2B Specific
  b2bPricing?: {
    enabled: boolean;
    tiers: {
      minQuantity: number;
      discountPercent: number;
      price?: number; // Optional fixed price
    }[];
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
}

interface IProductImage {
  _id: string;
  url: string; // Cloudinary URL
  alt: string;
  position: number; // Display order (0-based)
  isPrimary: boolean;
  width: number;
  height: number;
}

interface IProductVideo {
  _id: string;
  url: string; // Video URL
  thumbnail: string;
  position: number;
}

interface IVariant {
  _id: string;
  name: string; // e.g., "Medium / Red"
  sku: string;
  price?: number; // null = use base price
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  options: IVariantOption[];
  image?: IProductImage;
  isDefault: boolean;
}

interface IVariantOption {
  name: string; // e.g., "Size", "Color"
  value: string; // e.g., "Medium", "Red"
}

interface IProductAttribute {
  name: string; // e.g., "Material", "Warranty"
  value: string | string[]; // e.g., "Cotton" or ["1 year", "2 years"]
  visible: boolean; // Show on product page
}
```

## Database Indexes

```javascript
// Text search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Lookup queries
productSchema.index({ sellerId: 1 });
productSchema.index({ primaryCategoryId: 1 });
productSchema.index({ categoryIds: 1 });
productSchema.index({ brandId: 1 });

// Status & filtering
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ slug: 1 }, { unique: true });

// Analytics & sorting
productSchema.index({ rating: -1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ purchaseCount: -1 });
productSchema.index({ price: 1 });

// Soft delete
productSchema.index({ deletedAt: 1 });
```

## Key Features

### 1. SEO-Friendly URLs

- Unique slug for each product
- Auto-generated from name if not provided
- Used in public URLs: `/product/:slug`

### 2. Status Management

- **draft**: Not visible to public, seller editing
- **active**: Visible and purchasable
- **archived**: Not visible but accessible via direct link
- **out_of_stock**: Visible but not purchasable

### 3. Multi-Category Support

- Products can belong to multiple categories
- Primary category used for breadcrumbs and navigation
- Category pages show all products in that category

### 4. Variant System

- Support for size, color, or custom variants
- Each variant can have unique price, SKU, stock
- Images can be variant-specific

### 5. Image Management

- Unlimited images via Cloudinary
- Primary image for listings
- Position-based ordering
- Stored dimensions for display optimization

### 6. Review Aggregation

- `rating`: Average rating (calculated from reviews)
- `reviewCount`: Total approved reviews
- Updated by review service via events

### 7. B2B Pricing Tiers

- Optional quantity-based discounts
- Configurable per-product
- Separate from B2C pricing

## Migration Notes

### From Old Schema

```typescript
// Old
interface IProductOld {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sellerId?: string;
}

// Migration Steps:
// 1. Add new fields with defaults
// 2. Generate slug from name
// 3. Convert category to categoryIds[0]
// 4. Set status to 'active'
// 5. Create default brand if needed
```

### Data Migration Script

```javascript
// Generate slug from name
const slug = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

// Convert category string to array
const categoryIds = category ? [category] : [];
const primaryCategoryId = category || null;
```

## Usage Examples

### Creating a Product with Variants

```typescript
const product = await Product.create({
  name: 'Cotton T-Shirt',
  slug: 'cotton-t-shirt',
  description: 'Comfortable 100% cotton t-shirt',
  shortDescription: 'Classic fit cotton t-shirt',
  sellerId: 'seller123',
  price: 29.99,
  compareAtPrice: 39.99,
  stock: 0, // Track via variants
  hasVariants: true,
  variantType: 'size_color',
  variants: [
    {
      name: 'Small / White',
      sku: 'TSH-S-W',
      price: 29.99,
      stock: 50,
      options: [
        { name: 'Size', value: 'Small' },
        { name: 'Color', value: 'White' },
      ],
    },
  ],
  status: 'active',
});
```

### Querying Active Products

```typescript
const products = await Product.find({
  status: 'active',
  deletedAt: null,
})
  .populate('brandId')
  .populate('primaryCategoryId')
  .sort({ createdAt: -1 })
  .limit(20);
```

### Search with Full Text

```typescript
const results = await Product.find({
  status: 'active',
  deletedAt: null,
  $text: { $search: 'cotton t-shirt' },
});
```
