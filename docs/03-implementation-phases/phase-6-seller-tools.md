# Phase 6: Enhanced Seller Tools

## Overview

Phase 6 completes the transformation with advanced seller tools including bulk operations, inventory management, sales analytics, B2B wholesale features, and order fulfillment tools.

## Objectives

- [ ] Build bulk product upload (CSV)
- [ ] Implement bulk image upload
- [ ] Create inventory management dashboard
- [ ] Build sales analytics with charts
- [ ] Add order fulfillment tools
- [ ] Implement B2B wholesale pricing tiers
- [ ] Add B2B customer approval workflows
- [ ] Create quote management for sellers

## Database Schema

### Inventory Schema

```typescript
interface IInventoryAlert {
  _id: string;
  sellerId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;

  // Alert Details
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'discontinued';
  currentStock: number;
  threshold: number;

  // Status
  status: 'active' | 'resolved' | 'dismissed';
  resolvedAt?: Date;
  dismissedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface IInventoryMovement {
  _id: string;
  sellerId: string;
  productId: string;
  variantId?: string;

  // Movement Details
  type:
    | 'sale'
    | 'restock'
    | 'return'
    | 'adjustment'
    | 'transfer'
    | 'damage'
    | 'loss';
  quantity: number; // Positive for additions, negative for removals
  previousStock: number;
  newStock: number;

  // Reference
  referenceType?: 'order' | 'return' | 'manual' | 'purchase_order';
  referenceId?: string;

  // Notes
  notes?: string;
  performedBy?: string; // User ID

  // Timestamps
  createdAt: Date;
}
```

### Wholesale Pricing Schema

```typescript
interface IWholesaleTier {
  _id: string;
  sellerId: string;
  name: string; // e.g., "Bronze", "Silver", "Gold"
  description?: string;

  // Qualification
  minOrderQuantity?: number; // Min items per order
  minOrderAmount?: number; // Min order value
  requiredApproval?: boolean; // Needs seller approval

  // Pricing
  discountType: 'percentage' | 'fixed' | 'tiered';
  discountValue?: number; // For percentage/fixed
  tieredDiscounts?: Array<{
    minQuantity: number;
    discountPercent: number;
  }>;

  // Payment Terms
  paymentTerms?: string; // e.g., "Net 30", "Net 60"
  creditLimit?: number;

  // Customers
  customerIds?: string[]; // Assigned customers

  // Status
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface ICustomerSpecificPricing {
  _id: string;
  sellerId: string;
  customerId: string; // B2B buyer
  productId: string;

  // Pricing
  price?: number; // Fixed price for this customer
  discountPercent?: number; // Or discount from regular price
  currency: string;

  // Minimums
  minOrderQuantity?: number;

  // Validity
  validFrom?: Date;
  validUntil?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### B2B Customer Schema Enhancement

```typescript
// Extend User schema with B2B fields
interface IB2BCustomerProfile {
  userId: string;
  sellerId?: string; // If approved by specific seller

  // Business Info
  businessName: string;
  businessType: 'retailer' | 'wholesaler' | 'distributor' | 'reseller';
  taxId: string;
  businessLicense?: string;

  // Contact
  businessPhone: string;
  businessEmail: string;
  website?: string;

  // Address
  businessAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Verification
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationDocuments: string[];

  // Wholesale Status
  approvedSellers: string[]; // Sellers who approved this buyer
  wholesaleTiers: {
    [sellerId: string]: string; // Tier IDs per seller
  };

  // Credit
  creditLimit?: number;
  paymentTerms?: string;

  // Purchasing
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## API Design

### Bulk Operations Endpoints

```typescript
// Bulk Product Upload
POST   /api/seller/products/bulk
Content-Type: multipart/form-data
Body: {
  file: File (CSV or Excel)
  options: {
    updateExisting: boolean;
    defaultStatus: 'draft' | 'active';
    createCategories: boolean;
    createBrands: boolean;
  }
}

// Bulk Image Upload
POST   /api/seller/products/bulk/images
Content-Type: multipart/form-data
Body: {
  products: JSON string [{productId, sku, ...}]
  images: File[] (mapped by SKU)
}

// Bulk Update
PATCH  /api/seller/products/bulk
Body: {
  productIds: string[];
  updates: {
    status?: 'draft' | 'active' | 'archived';
    price?: number;
    compareAtPrice?: number;
    stock?: number;
    categoryIds?: string[];
    tags?: string[];
  }
}

// Bulk Delete
DELETE /api/seller/products/bulk
Body: {
  productIds: string[];
  reason?: string;
}
```

### Inventory Endpoints

```typescript
// Inventory Management
GET    /api/seller/inventory               # Get inventory summary
GET    /api/seller/inventory/alerts         # Get inventory alerts
PATCH  /api/seller/inventory/:productId     # Update stock
POST   /api/seller/inventory/adjustment     # Manual stock adjustment
GET    /api/seller/inventory/movements      # Get inventory movements

// Low Stock Report
GET    /api/seller/reports/inventory/low-stock
GET    /api/seller/reports/inventory/out-of-stock
GET    /api/seller/reports/inventory/overstock
```

### Analytics Endpoints

```typescript
// Sales Analytics
GET    /api/seller/analytics/sales
Query: {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  groupId?: string;  // Filter by category
}

// Top Products
GET    /api/seller/analytics/products/top
Query: { limit: number; period: string }

// Customer Analytics
GET    /api/seller/analytics/customers
Query: { period: string }

// Revenue Breakdown
GET    /api/seller/analytics/revenue/breakdown
Query: { period: string; groupBy: 'category' | 'product' | 'brand' }

// Export
GET    /api/seller/analytics/export
Query: { type: 'sales' | 'products' | 'customers'; format: 'csv' | 'xlsx' }
```

### Wholesale Endpoints

```typescript
// Wholesale Tiers
GET    /api/seller/wholesale/tiers          # Get seller's tiers
POST   /api/seller/wholesale/tiers          # Create tier
PUT    /api/seller/wholesale/tiers/:id      # Update tier
DELETE /api/seller/wholesale/tiers/:id      # Delete tier

// Customer-Specific Pricing
GET    /api/seller/wholesale/pricing        # Get all customer pricing
POST   /api/seller/wholesale/pricing        # Set customer pricing
PUT    /api/seller/wholesale/pricing/:id    # Update pricing
DELETE /api/seller/wholesale/pricing/:id    # Remove pricing

// B2B Customer Approval
GET    /api/seller/b2b/customers             # Get B2B customers
GET    /api/seller/b2b/customers/pending    # Get pending approvals
POST   /api/seller/b2b/customers/:id/approve # Approve customer
POST   /api/seller/b2b/customers/:id/reject  # Reject customer
POST   /api/seller/b2b/customers/:id/tier   # Assign tier

// Quote Management (Seller Side)
GET    /api/seller/quotes                    # Get received quotes
GET    /api/seller/quotes/:id                # Get quote details
PATCH  /api/seller/quotes/:id/status        # Update quote status
POST   /api/seller/quotes/:id/respond       # Respond to quote
POST   /api/seller/quotes/:id/convert       # Convert to order
```

## Frontend Components

### Bulk Upload System

```
web/src/app/(dashboard)/seller/products/bulk-upload/
├── page.tsx                      # Bulk upload main page
└── components/
    ├── CSVUploader.tsx           # File upload & validation
    ├── CSVTemplate.tsx           # Download template
    ├── CSVPreview.tsx            # Preview parsed data
    ├── CSVMapping.tsx            # Map CSV columns to fields
    ├── CSVErrors.tsx             # Show validation errors
    ├── CSVProgress.tsx           # Upload progress
    └── BulkImageUploader.tsx     # Upload images by SKU
```

**CSVUploader Component:**

```typescript
interface CSVUploaderProps {
  onUpload: (file: File, options: UploadOptions) => Promise<void>;
}

// Features:
// - Drag and drop file upload
// - Support CSV and Excel formats
// - File validation
// - Column mapping
// - Preview before import
// - Error highlighting
// - Progress tracking
// - Rollback on errors
```

### Inventory Management

```
web/src/app/(dashboard)/seller/inventory/
├── page.tsx                      # Inventory overview
├── alerts/page.tsx               # Low stock alerts
├── movements/page.tsx            # Inventory movements log
└── components/
    ├── InventoryTable.tsx        # Products with stock levels
    ├── StockAdjustment.tsx       # Manual stock adjustment
    ├── AlertList.tsx             # Stock alerts
    ├── MovementHistory.tsx       # Movement log
    └── RestockForm.tsx           # Restock items
```

**InventoryTable Component:**

```typescript
interface InventoryTableProps {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    variants?: Array<{
      name: string;
      stock: number;
    }>;
  }>;
  onStockUpdate: (productId: string, quantity: number) => void;
}

// Features:
// - Color-coded stock levels
// - Inline stock editing
// - Low stock indicators
// - Filter by status
// - Bulk stock update
// - Export to CSV
```

### Analytics Dashboard

```
web/src/app/(dashboard)/seller/analytics/
├── page.tsx                      # Analytics overview
├── sales/page.tsx                # Sales analytics
├── products/page.tsx             # Product analytics
├── customers/page.tsx            # Customer analytics
└── components/
    ├── RevenueChart.tsx          # Revenue over time
    ├── OrdersChart.tsx           # Orders over time
    ├── TopProductsTable.tsx      # Best-selling products
    ├── CategoryBreakdown.tsx     # Sales by category
    ├── CustomerInsights.tsx      # Customer metrics
    ├── PerformanceCard.tsx       # KPI cards
    └── ExportButton.tsx          # Export data
```

**RevenueChart Component:**

```typescript
interface RevenueChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
  data: Array<{
    date: Date;
    revenue: number;
    orders: number;
    profit?: number;
  }>;
  groupBy?: 'day' | 'week' | 'month';
}

// Features:
// - Line/area chart
// - Toggle between revenue/orders/profit
// - Compare with previous period
// - Export chart data
// - Drill down on click
```

### Wholesale Management

```
web/src/app/(dashboard)/seller/wholesale/
├── page.tsx                      # Wholesale overview
├── tiers/page.tsx                # Manage pricing tiers
├── pricing/page.tsx              # Customer-specific pricing
├── customers/page.tsx            # B2B customer management
└── components/
    ├── TierForm.tsx              # Create/edit tier
    ├── TierTable.tsx             # List tiers
    ├── CustomerPricingForm.tsx   # Set customer price
    ├── CustomerApprovalList.tsx  # Approve B2B customers
    └── BulkPricingUpdate.tsx     # Update multiple customers
```

**TierForm Component:**

```typescript
interface TierFormProps {
  tier?: IWholesaleTier;
  onSubmit: (tier: IWholesaleTier) => void;
}

// Features:
// - Tier name and description
// - Discount type (percentage/fixed/tiered)
// - Tiered quantity discounts builder
// - Minimum order requirements
// - Payment terms
// - Credit limit
// - Assign customers
```

**CustomerPricingForm Component:**

```typescript
interface CustomerPricingFormProps {
  customerId?: string;
  productId?: string;
  pricing?: ICustomerSpecificPricing;
  onSubmit: (pricing: ICustomerSpecificPricing) => void;
}

// Features:
// - Search products
// - Search customers
// - Set fixed price or discount %
// - Minimum order quantity
// - Validity period
// - Bulk assign
```

### Quote Management

```
web/src/app/(dashboard)/seller/quotes/
├── page.tsx                      # Quotes list
├── [id]/page.tsx                 # Quote details
└── components/
    ├── QuoteList.tsx             # Quotes with filters
    ├── QuoteDetail.tsx           # Full quote view
    ├── QuoteResponseForm.tsx     # Respond to quote
    ├── QuoteConvertDialog.tsx    # Convert to order
    └── QuoteAnalytics.tsx        # Quote conversion stats
```

**QuoteResponseForm Component:**

```typescript
interface QuoteResponseFormProps {
  quote: IQuote;
  onSubmit: (response: {
    status: 'approved' | 'rejected';
    sellerNote?: string;
    revisedItems?: Array<{
      itemId: string;
      unitPrice: number;
      estimatedLeadTime: string;
    }>;
    validUntil?: Date;
    paymentTerms?: string;
  }) => void;
}

// Features:
// - Approve/reject quote
// - Adjust pricing
// - Add lead times
// - Set payment terms
// - Add seller notes
// - Convert to order
```

### Order Fulfillment

```
web/src/app/(dashboard)/seller/orders/
├── page.tsx                      # Orders list
├── [id]/fulfill/page.tsx         # Fulfill order
└── components/
    ├── OrderFulfillmentForm.tsx  # Fulfillment form
    ├── TrackingNumberInput.tsx   # Add tracking
    ├── BulkFulfillment.tsx       # Fulfill multiple orders
    ├── ShippingLabel.tsx         # Generate label
    └── PackingSlip.tsx           # Print packing slip
```

## Implementation Steps

### Step 1: Bulk Operations (Week 1)

1. **CSV Parser Enhancement**
   - Handle complex CSV formats
   - Support Excel files
   - Column mapping
   - Validation

2. **Bulk Upload Service**
   - Process large files
   - Batch database operations
   - Progress tracking
   - Error handling

3. **Bulk Image Upload**
   - Map images to SKUs
   - Batch Cloudinary upload
   - Error recovery

### Step 2: Inventory Management (Week 1-2)

1. **Inventory Service**
   - Track movements
   - Generate alerts
   - Calculate stock levels

2. **Inventory Dashboard**
   - Stock overview
   - Low stock alerts
   - Movement history
   - Restock recommendations

### Step 3: Analytics (Week 2)

1. **Analytics Service**
   - Aggregate sales data
   - Calculate metrics
   - Generate reports

2. **Analytics Dashboard**
   - Revenue charts
   - Top products
   - Customer insights
   - Export functionality

### Step 4: B2B Wholesale (Week 2-3)

1. **Wholesale Pricing**
   - Tier management
   - Customer-specific pricing
   - Bulk pricing updates

2. **B2B Customer Approval**
   - Approval workflow
   - Tier assignment
   - Credit limits

### Step 5: Quote Management (Week 3)

1. **Seller Quote Tools**
   - View quote requests
   - Respond to quotes
   - Convert to orders
   - Quote analytics

### Step 6: Order Fulfillment (Week 3-4)

1. **Fulfillment Tools**
   - Bulk fulfillment
   - Tracking numbers
   - Shipping labels
   - Packing slips

## Success Criteria

### Bulk Operations

- ✅ CSV upload works
- ✅ Excel files supported
- ✅ Validation catches errors
- ✅ Progress tracking works
- ✅ Bulk image upload works

### Inventory

- ✅ Stock levels are accurate
- ✅ Low stock alerts trigger
- ✅ Movements are tracked
- ✅ Manual adjustments work

### Analytics

- ✅ Revenue charts display
- ✅ Top products are accurate
- ✅ Export works
- ✅ Date filters work

### B2B Features

- ✅ Tiers can be created
- ✅ Customer pricing works
- ✅ Approvals function
- ✅ Quotes convert to orders

## File Structure

### Backend Enhancements

```
services/product-service/src/
├── routes/
│   └── seller.routes.ts           # Enhanced
├── controllers/
│   └── seller.controller.ts       # Enhanced
└── services/
    ├── bulk-upload.service.ts     # New
    ├── inventory.service.ts       # New
    └── wholesale.service.ts       # New

services/analytics-service/src/
├── routes/
│   └── analytics.routes.ts        # Enhanced
└── services/
    └── seller-analytics.service.ts # New
```

### Frontend

```
web/src/app/(dashboard)/seller/
├── products/
│   └── bulk-upload/
│       └── page.tsx
├── inventory/
│   ├── page.tsx
│   ├── alerts/page.tsx
│   └── movements/page.tsx
├── analytics/
│   ├── page.tsx
│   ├── sales/page.tsx
│   ├── products/page.tsx
│   └── customers/page.tsx
├── wholesale/
│   ├── page.tsx
│   ├── tiers/page.tsx
│   ├── pricing/page.tsx
│   └── customers/page.tsx
├── quotes/
│   ├── page.tsx
│   └── [id]/page.tsx
└── orders/
    └── [id]/fulfill/page.tsx

web/src/components/seller/
├── bulk/
│   ├── CSVUploader.tsx
│   ├── CSVPreview.tsx
│   └── BulkImageUploader.tsx
├── inventory/
│   ├── InventoryTable.tsx
│   └── StockAdjustment.tsx
├── analytics/
│   ├── RevenueChart.tsx
│   └── TopProducts.tsx
├── wholesale/
│   ├── TierForm.tsx
│   └── CustomerPricingForm.tsx
└── fulfillment/
    └── OrderFulfillmentForm.tsx
```

## Testing Checklist

### Bulk Upload

- [ ] Upload CSV with products
- [ ] Upload Excel file
- [ ] Map columns correctly
- [ ] Validate data
- [ ] Show errors
- [ ] Upload images by SKU
- [ ] Progress bar updates
- [ ] Rollback on errors

### Inventory

- [ ] View inventory levels
- [ ] Receive low stock alert
- [ ] Adjust stock manually
- [ ] View movement history
- [ ] Filter by status

### Analytics

- [ ] View revenue chart
- [ ] Change date range
- [ ] See top products
- [ ] View customer insights
- [ ] Export to CSV
- [ ] Compare periods

### Wholesale

- [ ] Create pricing tier
- [ ] Set customer pricing
- [ ] Approve B2B customer
- [ ] Assign tier to customer
- [ ] View wholesale prices
- [ ] Update pricing in bulk

### Quotes

- [ ] View quote requests
- [ ] Respond to quote
- [ ] Adjust pricing
- [ ] Set payment terms
- [ ] Convert to order
- [ ] View quote analytics

## Completion Checklist

After Phase 6 is complete, the Vortex platform transformation is **100% complete**:

✅ Phase 1: Foundation
✅ Phase 2: Rich Catalog
✅ Phase 3: Shopping Features
✅ Phase 4: Reviews & Ratings
✅ Phase 5: Marketing & SEO
✅ Phase 6: Enhanced Seller Tools

**Final Feature Set:**

- Public storefront (B2C)
- B2B wholesale platform
- Rich product catalog
- Complete shopping experience
- Reviews and ratings
- Marketing and promotions
- Advanced seller tools
- Analytics and reporting

The platform has been transformed from a minimal B2B ordering system into a **production-ready hybrid e-commerce platform**.
