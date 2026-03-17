# Phase 2: Rich Catalog Features

## Overview

Phase 2 extends the product catalog with advanced features including product variants management, enhanced filtering, category/brand management dashboards, and bulk operations.

## Objectives

- [ ] Implement product variant management system
- [ ] Create variant selector UI components
- [ ] Build category management dashboard
- [ ] Build brand management dashboard
- [ ] Implement advanced attribute system
- [ ] Add bulk product operations (CSV upload)

## Database Schema Updates

### Variant Management

The variant system is already defined in the Product schema. This phase focuses on:

1. **Variant CRUD Operations**
   - Create variants for products
   - Update variant stock/pricing
   - Delete variants
   - Variant image management

2. **Variant Inventory Management**
   - Track stock per variant
   - Aggregate stock across variants for parent product
   - Low stock alerts per variant

### Attribute System Enhancement

Current attributes are simple key-value pairs. Enhancements needed:

```typescript
// Enhanced attribute system
interface IAttributeDefinition {
  _id: string;
  name: string; // e.g., "Material", "Size", "Color"
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: string[]; // For select/multiselect types
  defaultValue?: any;
  unit?: string; // For number types (e.g., "cm", "kg")
  categoryId?: string; // Category-specific attributes
}

interface IProductAttributeValue {
  attributeDefinitionId: string;
  value: any;
}
```

## API Design

### Variant Endpoints

```typescript
// Create variant
POST /api/products/:productId/variants
Body: {
  name: string;
  sku: string;
  price?: number;
  stock: number;
  options: Array<{ name: string; value: string }>;
  image?: IProductImage;
}

// Update variant
PUT /api/products/:productId/variants/:variantId
Body: Partial<IVariant>

// Delete variant
DELETE /api/products/:productId/variants/:variantId

// Bulk update variants
PATCH /api/products/:productId/variants
Body: {
  updates: Array<{
    variantId: string;
    changes: Partial<IVariant>
  }>
}
```

### Attribute Definition Endpoints

```typescript
// Create attribute definition
POST /api/attributes
Body: {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: string[];
  categoryId?: string;
}

// List attribute definitions
GET /api/attributes?categoryId=xxx

// Update attribute definition
PUT /api/attributes/:id

// Delete attribute definition
DELETE /api/attributes/:id
```

### Bulk Operations

```typescript
// Bulk product upload
POST /api/products/bulk
Content-Type: multipart/form-data
Body: {
  file: File (CSV)
  options: {
    updateExisting: boolean;
    defaultStatus: 'draft' | 'active';
  }
}

// Bulk update
PATCH /api/products/bulk
Body: {
  productIds: string[];
  changes: Partial<IProduct>
}

// Bulk delete
DELETE /api/products/bulk
Body: {
  productIds: string[];
}
```

## Frontend Components

### Seller Dashboard - Variant Management

```
web/src/app/(dashboard)/seller/products/[id]/variants/
├── page.tsx                    # Variants list page
├── components/
│   ├── VariantTable.tsx        # Variants table with inline editing
│   ├── VariantForm.tsx         # Create/edit variant form
│   ├── VariantStockManager.tsx # Stock management per variant
│   └── VariantBulkEditor.tsx   # Bulk edit variants
```

**VariantTable Component:**

```typescript
interface VariantTableProps {
  productId: string;
  variants: IVariant[];
  onEdit: (variant: IVariant) => void;
  onDelete: (variantId: string) => void;
  onBulkUpdate: (updates: BulkVariantUpdate[]) => void;
}

// Columns:
// - Variant Name
// - SKU
// - Options (Size, Color, etc.)
// - Price
// - Compare At Price
// - Stock
// - Status
// - Actions (Edit, Delete)
```

### Attribute Management

```
web/src/app/(dashboard)/system/attributes/
├── page.tsx                    # Attribute definitions list
├── [id]/edit/page.tsx          # Edit attribute definition
└── components/
    ├── AttributeForm.tsx       # Create/edit form
    ├── AttributeList.tsx       # List with filtering
    └── AttributePreview.tsx    # Preview how attribute appears
```

### Category Management Dashboard

```
web/src/app/(dashboard)/system/categories/
├── page.tsx                    # Categories tree view
├── new/page.tsx                # Create category
├── [id]/edit/page.tsx          # Edit category
└── components/
    ├── CategoryTree.tsx        # Hierarchical tree view
    ├── CategoryForm.tsx        # Create/edit form
    ├── CategoryProducts.tsx    # Products in category
    └── CategoryStats.tsx       # Category statistics
```

**CategoryTree Component:**

```typescript
interface CategoryTreeProps {
  categories: ICategory[];
  onSelect: (category: ICategory) => void;
  onEdit: (category: ICategory) => void;
  onDelete: (categoryId: string) => void;
  onMove: (categoryId: string, newParentId: string | null) => void;
}

// Features:
// - Drag and drop to reorder
// - Drag and drop to change parent
// - Expand/collapse branches
// - Add subcategory button
// - Edit/delete actions
```

### Brand Management Dashboard

```
web/src/app/(dashboard)/system/brands/
├── page.tsx                    # Brands list
├── new/page.tsx                # Create brand
├── [id]/edit/page.tsx          # Edit brand
└── components/
    ├── BrandTable.tsx          # Brands table
    ├── BrandForm.tsx           # Create/edit form
    ├── BrandProducts.tsx       # Products by brand
    └── BrandStats.tsx          # Brand statistics
```

### Bulk Upload System

```
web/src/app/(dashboard)/seller/products/bulk-upload/
├── page.tsx                    # Bulk upload main page
└── components/
    ├── CSVUploader.tsx         # File upload with validation
    ├── CSVTemplate.tsx         # Download template button
    ├── CSVPreview.tsx          # Preview parsed CSV
    ├── CSVMErrors.tsx          # Show validation errors
    └── CSVProgress.tsx         # Upload progress indicator
```

**CSV Format:**

```csv
name,slug,description,price,stock,category,tags,brand,variant_name,variant_sku,variant_price,variant_stock
"T-Shirt","t-shirt","Cotton t-shirt",19.99,100,"clothing","casual,summer","Nike","Small/Red","TSH-S-R",19.99,50
"T-Shirt","t-shirt","Cotton t-shirt",19.99,100,"clothing","casual,summer","Nike","Medium/Blue","TSH-M-B",19.99,30
```

## Implementation Steps

### Step 1: Backend Variant Management (Week 1)

1. **Variant Routes**
   - Create `services/product-service/src/routes/variant.routes.ts`
   - Add variant CRUD endpoints
   - Add bulk variant operations

2. **Variant Controller**
   - Create `services/product-service/src/controllers/variant.controller.ts`
   - Implement variant creation with validation
   - Implement stock aggregation logic

3. **Variant Service**
   - Create `services/product-service/src/services/variant.service.ts`
   - Business logic for variant operations
   - Handle parent product stock updates

### Step 2: Attribute System (Week 1-2)

1. **Attribute Model**
   - Create `AttributeDefinition` model
   - Create `ProductAttributeValue` model

2. **Attribute Routes**
   - Create CRUD routes for attribute definitions
   - Create endpoints for assigning attributes to products

3. **Category-Attribute Mapping**
   - Allow defining attributes per category
   - Auto-assign required attributes when product added to category

### Step 3: Category Management (Week 2)

1. **Category Service Methods**
   - Add tree traversal methods
   - Add path management for breadcrumbs
   - Add product count aggregation

2. **Category Controller**
   - CRUD operations
   - Move category (change parent)
   - Reorder siblings

### Step 4: Brand Management (Week 2)

1. **Brand Service**
   - CRUD operations
   - Product count updates

2. **Brand Controller**
   - Standard CRUD
   - Merge brands (for duplicates)

### Step 5: Bulk Operations (Week 3)

1. **CSV Parser**
   - Parse CSV with validation
   - Handle variant rows (group by product)
   - Error collection and reporting

2. **Bulk Upload Service**
   - Process validated data
   - Create/update products
   - Create variants
   - Transaction handling (rollback on errors)

3. **Progress Tracking**
   - WebSocket for real-time progress
   - Status updates (parsing, validating, importing)

### Step 6: Frontend Implementation (Week 3-4)

1. **Variant Management UI**
   - Variant table with inline editing
   - Variant creation form
   - Stock management per variant

2. **Category Management**
   - Tree view with drag-drop
   - Category form with image upload
   - Product assignment

3. **Brand Management**
   - Brand table
   - Brand form with logo/banner
   - Product list per brand

4. **Bulk Upload**
   - CSV upload component
   - Validation preview
   - Progress tracking
   - Error reporting

## Success Criteria

### Backend

- ✅ Variants can be created, updated, deleted
- ✅ Variant stock reflects in parent product availability
- ✅ Attributes can be defined per category
- ✅ Products can be bulk uploaded via CSV
- ✅ Categories can be managed via tree structure
- ✅ Brands can be managed with images

### Frontend

- ✅ Sellers can manage product variants
- ✅ Admin can manage category hierarchy
- ✅ Admin can manage brands
- ✅ Sellers can bulk upload products
- ✅ CSV validation shows errors clearly
- ✅ Bulk upload progress is visible

### User Experience

- ✅ Variant selection is intuitive on product page
- ✅ Category tree is easy to navigate
- ✅ Bulk upload handles errors gracefully
- ✅ Attribute management is flexible

## File Structure

### Backend

```
services/product-service/src/
├── models/
│   ├── AttributeDefinition.ts      # New
│   └── ProductAttributeValue.ts    # New
├── routes/
│   ├── variant.routes.ts            # New
│   ├── attribute.routes.ts          # New
│   ├── bulk.routes.ts               # New
│   └── category-management.routes.ts # New
├── controllers/
│   ├── variant.controller.ts        # New
│   ├── attribute.controller.ts      # New
│   ├── bulk.controller.ts           # New
│   └── category-management.controller.ts # New
└── services/
    ├── variant.service.ts           # New
    ├── attribute.service.ts         # New
    ├── bulk.service.ts              # New
    └── csv-parser.service.ts        # New
```

### Frontend

```
web/src/app/(dashboard)/
├── seller/products/[id]/variants/
│   └── page.tsx                     # New
├── system/categories/
│   ├── page.tsx                     # New
│   ├── new/page.tsx                 # New
│   └── [id]/edit/page.tsx           # New
├── system/brands/
│   ├── page.tsx                     # New
│   ├── new/page.tsx                 # New
│   └── [id]/edit/page.tsx           # New
├── system/attributes/
│   ├── page.tsx                     # New
│   └── [id]/edit/page.tsx           # New
└── seller/products/bulk-upload/
    └── page.tsx                     # New

web/src/components/
├── seller/
│   ├── VariantTable.tsx             # New
│   ├── VariantForm.tsx              # New
│   ├── CSVUploader.tsx              # New
│   └── CSVPreview.tsx               # New
├── admin/
│   ├── CategoryTree.tsx             # New
│   ├── CategoryForm.tsx             # New
│   ├── BrandTable.tsx               # New
│   └── BrandForm.tsx                # New
└── shop/
    └── VariantSelector.tsx          # Enhanced
```

## Testing Checklist

### Variant Management

- [ ] Create variant for product
- [ ] Update variant price/stock
- [ ] Delete variant
- [ ] Variant selection updates price
- [ ] Variant selection updates stock display
- [ ] Out of stock variants disabled

### Bulk Upload

- [ ] Upload CSV with valid products
- [ ] Upload CSV with variants
- [ ] Validate required fields
- [ ] Show validation errors
- [ ] Handle duplicate SKUs
- [ ] Update existing products
- [ ] Progress tracking works

### Category Management

- [ ] Create category
- [ ] Create subcategory
- [ ] Move category (change parent)
- [ ] Reorder categories
- [ ] Delete category (with products reassignment)
- [ ] Category tree displays correctly

### Brand Management

- [ ] Create brand with logo
- [ ] Update brand
- [ ] Delete brand
- [ ] View brand products
- [ ] Merge duplicate brands

## Next Phase

After completing Phase 2, proceed to **Phase 3: Shopping Features** which includes wishlist, product comparison, and recommendation systems.
