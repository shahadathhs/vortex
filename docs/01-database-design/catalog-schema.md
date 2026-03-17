# Category and Brand Schema Design

## Overview

Categories and Brands provide the primary organization structure for products. Categories support hierarchical nesting for complex catalog structures.

## Category Schema

```typescript
interface ICategory {
  _id: string;
  name: string;
  slug: string; // SEO-friendly URL
  description?: string;

  // Hierarchy
  parentId?: string; // Parent category ID
  level: number; // 0 = root level, 1 = first subcategory, etc.
  path: string[]; // [categoryId, categoryId, ...] for breadcrumb

  // Display
  image?: ICategoryImage;
  icon?: string; // Icon name or URL
  color?: string; // Hex color for UI theming

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Settings
  isActive: boolean; // Disabled categories hidden from navigation
  displayOrder: number; // Sort order (0 = first)
  showInNavbar: boolean; // Show in main navigation

  // Products
  productCount: number; // Cached count of active products

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface ICategoryImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}
```

### Category Indexes

```javascript
// Navigation
categorySchema.index({ parentId: 1, displayOrder: 1 });
categorySchema.index({ slug: 1 }, { unique: true });

// Status
categorySchema.index({ isActive: 1 });

// Path queries for subcategories
categorySchema.index({ path: 1 });
```

### Category Features

**1. Hierarchical Structure**

```typescript
// Root category
{
  name: "Electronics",
  slug: "electronics",
  parentId: null,
  level: 0,
  path: ["electronicsId"]
}

// Subcategory
{
  name: "Computers",
  slug: "computers",
  parentId: "electronicsId",
  level: 1,
  path: ["electronicsId", "computersId"]
}

// Sub-subcategory
{
  name: "Laptops",
  slug: "laptops",
  parentId: "computersId",
  level: 2,
  path: ["electronicsId", "computersId", "laptopsId"]
}
```

**2. Breadcrumb Generation**

```typescript
async function getBreadcrumb(categoryId: string) {
  const category = await Category.findById(categoryId);
  const categories = await Category.find({
    _id: { $in: category.path },
  }).sort({ level: 1 });
  return categories;
}
```

**3. Product Count Caching**

```typescript
// Updated by product service via events
// Incremented when product added to category
// Decremented when product removed or archived
```

## Brand Schema

```typescript
interface IBrand {
  _id: string;
  name: string;
  slug: string; // SEO-friendly URL
  description?: string;

  // Media
  logo?: string; // Brand logo URL
  banner?: string; // Large banner image URL

  // External Links
  website?: string; // Official brand website

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Settings
  isActive: boolean; // Disabled brands hidden from filters
  displayOrder: number; // Sort order

  // Products
  productCount: number; // Cached count of active products

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Brand Indexes

```javascript
brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ isActive: 1, displayOrder: 1 });
brandSchema.index({ name: 'text' }); // Search
```

## Usage Examples

### Creating Category Hierarchy

```typescript
// Create root category
const electronics = await Category.create({
  name: 'Electronics',
  slug: 'electronics',
  description: 'All electronic devices and accessories',
  isActive: true,
  showInNavbar: true,
  displayOrder: 0,
  level: 0,
  path: [],
});

// Create subcategory
const computers = await Category.create({
  name: 'Computers',
  slug: 'computers',
  parentId: electronics._id,
  level: 1,
  path: [electronics._id.toString()],
  isActive: true,
  showInNavbar: true,
  displayOrder: 0,
});

// Create sub-subcategory
const laptops = await Category.create({
  name: 'Laptops',
  slug: 'laptops',
  parentId: computers._id,
  level: 2,
  path: [electronics._id.toString(), computers._id.toString()],
  isActive: true,
  showInNavbar: false,
  displayOrder: 0,
});
```

### Getting Category Tree

```typescript
async function getCategoryTree(parentId: string | null = null) {
  const categories = await Category.find({
    parentId,
    isActive: true,
  })
    .populate('parentId')
    .sort({ displayOrder: 1 });

  const tree = await Promise.all(
    categories.map(async (cat) => ({
      ...cat.toObject(),
      children: await getCategoryTree(cat._id.toString()),
    })),
  );

  return tree;
}
```

### Query Products by Category

```typescript
// Get products in category and all subcategories
async function getProductsInCategoryTree(categoryId: string) {
  const category = await Category.findById(categoryId);
  const descendantIds = await Category.find({
    path: categoryId,
  }).distinct('_id');

  const allCategoryIds = [categoryId, ...descendantIds];

  const products = await Product.find({
    status: 'active',
    deletedAt: null,
    categoryIds: { $in: allCategoryIds },
  });

  return products;
}
```

### Brand Operations

```typescript
// Create brand
const brand = await Brand.create({
  name: 'Apple',
  slug: 'apple',
  description: 'Technology company',
  logo: 'https://cloudinary.com/...',
  website: 'https://apple.com',
  isActive: true,
});

// Query products by brand
const products = await Product.find({
  brandId: brand._id,
  status: 'active',
  deletedAt: null,
});

// Get all active brands for filter
const brands = await Brand.find({ isActive: true }).sort({
  displayOrder: 1,
  name: 1,
});
```

## Category Path Management

When creating a category, the path must include all ancestor IDs:

```typescript
async function createCategory(data: ICreateCategoryInput) {
  let path: string[] = [];
  let level = 0;

  if (data.parentId) {
    const parent = await Category.findById(data.parentId);
    if (!parent) throw new Error('Parent not found');

    path = [...parent.path, parent._id.toString()];
    level = parent.level + 1;
  }

  const category = await Category.create({
    ...data,
    path,
    level,
  });

  return category;
}
```

## Migration from String Category

The old schema had a simple `category: string` field on products. Migration steps:

```typescript
// 1. Create categories from unique category values
const uniqueCategories = await Product.distinct('category');

for (const name of uniqueCategories) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  await Category.create({
    name,
    slug,
    isActive: true,
    level: 0,
    path: [],
    displayOrder: 0,
  });
}

// 2. Update products to use categoryIds
const categoryMap = new Map(
  (await Category.find()).map((c) => [c.name, c._id]),
);

await Product.updateMany({ category: { $exists: true, $ne: '' } }, [
  {
    $set: {
      categoryIds: ['$category'],
      primaryCategoryId: {
        $arrayElemAt: [
          {
            $map: {
              input: ['$category'],
              as: 'catName',
              in: { $arrayElemAt: ['$categoryIds', 0] },
            },
          },
          0,
        ],
      },
    },
  },
]);
```
