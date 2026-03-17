# Phase 3: Shopping Features

## Overview

Phase 3 implements essential shopping features that enhance the customer experience including wishlist management, product comparison, recommendation engine, and B2B bulk ordering capabilities.

## Objectives

- [ ] Implement wishlist system (add, remove, share)
- [ ] Create product comparison feature
- [ ] Build recommendation engine
- [ ] Add recently viewed tracking
- [ ] Create quick view modal
- [ ] Implement B2B bulk ordering interface
- [ ] Add B2B quote request system

## Database Schema

### Wishlist Schema

```typescript
interface IWishlist {
  _id: string;
  userId: string;
  items: IWishlistItem[];
  shareToken?: string; // For public wishlist sharing
  isPublic: boolean;
  name?: string; // Support multiple wishlists
  default: boolean; // Mark as default wishlist

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface IWishlistItem {
  productId: string;
  variantId?: string;
  addedAt: Date;
  note?: string; // User notes
  priority?: number; // 1-5 for priority
}
```

**Indexes:**

```javascript
wishlistSchema.index({ userId: 1, default: -1 });
wishlistSchema.index({ shareToken: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ 'items.productId': 1 });
```

### Comparison Schema

```typescript
interface IComparison {
  _id: string;
  userId: string;
  productIds: string[];
  attributes: string[]; // Which attributes to compare
  addedAt: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

```javascript
comparisonSchema.index({ userId: 1 });
comparisonSchema.index({ productIds: 1 });
```

### Recently Viewed Schema

```typescript
interface IRecentlyViewed {
  _id: string;
  userId: string;
  sessionId?: string; // For guest users
  productViews: IProductView[];
}

interface IProductView {
  productId: string;
  variantId?: string;
  viewedAt: Date;
  referrer?: string; // Where they came from
}
```

**Indexes:**

```javascript
recentlyViewedSchema.index({ userId: 1, 'productViews.viewedAt': -1 });
recentlyViewedSchema.index({ sessionId: 1, 'productViews.viewedAt': -1 });
```

### Quote Schema (B2B)

```typescript
interface IQuote {
  _id: string;
  quoteNumber: string; // Human-readable (QT-2024-001234)

  // Customer Info
  userId: string;
  businessName?: string;
  contactEmail: string;
  contactPhone: string;

  // Quote Items
  items: IQuoteItem[];
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  taxAmount: number;
  total: number;

  // Quote Status
  status:
    | 'draft'
    | 'submitted'
    | 'reviewing'
    | 'approved'
    | 'rejected'
    | 'expired'
    | 'converted_to_order';
  validUntil: Date;

  // Notes
  customerNote?: string;
  sellerNotes?: string;
  rejectionReason?: string;

  // Pricing
  currency: string;
  paymentTerms?: string; // e.g., "Net 30", "Net 60"

  // Timestamps
  submittedAt?: Date;
  respondedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IQuoteItem {
  productId: string;
  variantId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  estimatedLeadTime?: string; // e.g., "2-3 weeks"
  notes?: string;
}
```

## API Design

### Wishlist Service Endpoints

```typescript
// Wishlist CRUD
GET    /api/wishlist                    # Get user's wishlists
GET    /api/wishlist/default            # Get default wishlist
POST   /api/wishlist                    # Create new wishlist
PUT    /api/wishlist/:id                # Update wishlist
DELETE /api/wishlist/:id                # Delete wishlist

// Wishlist Items
POST   /api/wishlist/:id/items          # Add item to wishlist
DELETE /api/wishlist/:id/items/:itemId  # Remove item from wishlist
PATCH  /api/wishlist/:id/items          # Bulk update items
GET    /api/wishlist/:id/share          # Get shareable link
POST   /api/wishlist/:id/share          # Generate share token

// Public Wishlist (via share token)
GET    /api/public/wishlist/:token      # View shared wishlist
```

### Comparison Endpoints

```typescript
GET    /api/compare                     # Get user's comparison list
POST   /api/compare/items               # Add product to comparison
DELETE /api/compare/items/:productId    # Remove from comparison
DELETE /api/compare                     # Clear comparison
GET    /api/compare/attributes          # Get comparable attributes
```

### Recommendations Endpoints

```typescript
// Recommendation engine
GET    /api/recommendations/related/:productId   # Related products
GET    /api/recommendations/trending              # Trending products
GET    /api/recommendations/personalized          # Personalized recommendations
GET    /api/recommendations/bought-together       # Frequently bought together
GET    /api/recommendations/recently-viewed       # Based on browsing history
```

### Quote Endpoints (B2B)

```typescript
// Quote management
GET    /api/quotes                       # Get user's quotes
GET    /api/quotes/:id                   # Get quote details
POST   /api/quotes                       # Create quote request
PUT    /api/quotes/:id                   # Update quote (draft only)
DELETE /api/quotes/:id                   # Delete quote
POST   /api/quotes/:id/submit            # Submit quote for review

// Seller quote management
GET    /api/seller/quotes                 # Get quotes for seller's products
PATCH /api/seller/quotes/:id/status      # Update quote status
POST   /api/seller/quotes/:id/respond     # Respond to quote
POST   /api/seller/quotes/:id/convert     # Convert quote to order
```

### Recently Viewed Endpoints

```typescript
GET    /api/recently-viewed               # Get recently viewed products
POST   /api/recently-viewed               # Track product view
DELETE /api/recently-viewed               # Clear history
```

## Frontend Components

### Wishlist Components

```
web/src/components/wishlist/
├── WishlistButton.tsx           # Heart icon to add to wishlist
├── WishlistDropdown.tsx         # Multi-wishlist selector
├── WishlistGrid.tsx             # Display wishlist items
├── WishlistShare.tsx            # Share dialog
├── WishlistCreate.tsx           # Create new wishlist dialog
└── WishlistItemCard.tsx         # Individual wishlist item card
```

**WishlistButton Component:**

```typescript
interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  isWishlisted: boolean;
  onToggle: (inWishlist: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}
```

**WishlistGrid Component:**

```typescript
interface WishlistGridProps {
  wishlistId: string;
  editable?: boolean;
  onRemove?: (itemId: string) => void;
  onMove?: (itemId: string, targetWishlistId: string) => void;
}

// Features:
// - Grid of product cards
// - Remove from wishlist
// - Move to another wishlist
// - Add to cart
// - Add note
// - Set priority
```

### Comparison Components

```
web/src/components/compare/
├── CompareButton.tsx            # Add to comparison button
├── CompareBar.tsx               # Floating bar showing items
├── CompareTable.tsx             # Comparison table
├── CompareCard.tsx              # Mini product card for comparison
└── CompareFilters.tsx           # Filter which attributes to show
```

**CompareTable Component:**

```typescript
interface CompareTableProps {
  productIds: string[];
  selectedAttributes?: string[];
  onRemove?: (productId: string) => void;
}

// Layout:
// Rows: Attribute names (Price, Rating, Brand, etc.)
// Columns: Products being compared
// Cells: Attribute values per product
// Features:
// - Highlight differences
// - Show/hide attributes
// - Remove product
// - Add to cart from comparison
```

**CompareBar Component:**

```typescript
interface CompareBarProps {
  productIds: string[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

// Features:
// - Shows mini product cards
// - Count of products (max 4)
// - "Compare Now" button
// - "Clear All" button
// - Remove individual products
```

### Recommendation Components

```
web/src/components/recommendations/
├── RelatedProducts.tsx          # Related products carousel
├── TrendingProducts.tsx         # Trending products section
├── PersonalizedFeed.tsx         # Personalized recommendations
├── BoughtTogether.tsx           # Frequently bought together
└── RecentlyViewed.tsx           # Recently viewed products
```

### Quick View Modal

```
web/src/components/product/QuickView.tsx

interface QuickViewProps {
  productId: string;
  trigger?: React.ReactNode;
  onAddToCart?: (variantId: string, quantity: number) => void;
  onClose?: () => void;
}

// Features:
// - Modal with product preview
// - Image gallery (mini)
// - Variant selection
// - Add to cart
// - View full details link
// - Wishlist button
```

### B2B Quote Components

```
web/src/app/(dashboard)/buyer/quotes/
├── page.tsx                     # Quotes list
├── new/page.tsx                 # Create quote request
├── [id]/page.tsx                # Quote details
└── components/
    ├── QuoteForm.tsx            # Quote creation form
    ├── QuoteItems.tsx           # Line items editor
    ├── QuoteStatus.tsx          # Status badge
    ├── QuoteSummary.tsx         # Quote totals
    └── QuoteActions.tsx         # Action buttons (submit, edit, convert)
```

**QuoteForm Component:**

```typescript
interface QuoteFormProps {
  quote?: IQuote;
  onSubmit: (quote: IQuote) => void;
  mode: 'create' | 'edit';
}

// Features:
// - Add products (with search)
// - Set quantities
// - Request pricing (for custom items)
// - Add notes
// - Set validity period
// - Business information
```

### B2B Bulk Ordering

```
web/src/app/(dashboard)/buyer/bulk-order/
├── page.tsx                     # Bulk order form
└── components/
    ├── BulkOrderGrid.tsx        # Product quantity grid
    ├── BulkOrderSummary.tsx     # Order summary
    ├── CSVImport.tsx            # Import from CSV
    └── QuickOrderPad.tsx        # Quick order from past orders
```

**BulkOrderGrid Component:**

```typescript
interface BulkOrderGridProps {
  products: IProduct[];
  quantities: Record<string, number>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

// Layout:
// Rows: Products (with images)
// Columns: Quantity input fields
// Features:
// - Filter by category
// - Search products
// - Add to order
// - Show tiered pricing
// - Calculate bulk discounts
```

## Recommendation Algorithm

### Collaborative Filtering

```typescript
// "Customers who bought this also bought"
interface BoughtTogetherRecommendation {
  productId: string;
  relatedProducts: Array<{
    productId: string;
    confidence: number; // 0-1
    lift: number; // >1 means significant association
  }>;
}

// Algorithm:
// 1. Find all orders containing the product
// 2. Find other products in those orders
// 3. Calculate confidence (co-occurrence / total orders)
// 4. Calculate lift (confidence / expected confidence)
// 5. Return top N sorted by confidence
```

### Content-Based Filtering

```typescript
// Similar products based on attributes
interface ContentBasedRecommendation {
  productId: string;
  similarProducts: Array<{
    productId: string;
    similarityScore: number; // 0-1
  }>;
}

// Algorithm:
// 1. Extract product features (category, tags, attributes)
// 2. Calculate similarity with other products
// 3. Weight features (category > tags > attributes)
// 4. Return top N most similar
```

### Hybrid Approach

```typescript
// Combine collaborative and content-based
interface RecommendationResult {
  productId: string;
  recommendations: Array<{
    productId: string;
    score: number; // Weighted combination
    reasons: string[]; // "Bought together", "Similar category"
  }>;
}

// Score = (collaborative_score * 0.6) + (content_score * 0.4)
```

## Implementation Steps

### Step 1: Wishlist Service (Week 1)

1. **Create Wishlist Service**
   - New microservice: `/services/wishlist-service/`
   - Database: `vortex-wishlists`
   - Event consumer for product updates

2. **Implement Wishlist CRUD**
   - Create, read, update, delete wishlists
   - Add/remove items
   - Share functionality

3. **Frontend Integration**
   - Wishlist button on products
   - Wishlist page
   - Share dialog

### Step 2: Comparison Feature (Week 1-2)

1. **Comparison Service**
   - Use existing product service
   - Add comparison endpoints
   - Session storage for guest users

2. **Comparison UI**
   - Add to comparison button
   - Comparison bar
   - Comparison page

### Step 3: Recommendation Engine (Week 2)

1. **Recommendation Service**
   - New service: `/services/recommendation-service/`
   - Implement algorithms
   - Pre-compute recommendations (background job)

2. **Recommendation Components**
   - Related products
   - Trending products
   - Personalized feed

### Step 4: Quick View Modal (Week 2)

1. **Product Quick View**
   - Modal component
   - Minimal product info
   - Add to cart functionality

### Step 5: B2B Quote System (Week 3)

1. **Quote Service**
   - New service: `/services/quote-service/`
   - Database: `vortex-quotes`
   - Integration with product and user services

2. **Quote Management**
   - Buyer quote creation
   - Seller quote review
   - Quote to order conversion

3. **Frontend**
   - Quote request form
   - Quote dashboard
   - Quote status tracking

### Step 6: B2B Bulk Ordering (Week 3-4)

1. **Bulk Order Interface**
   - Product grid with quantities
   - Tiered pricing display
   - CSV import

2. **Quick Order Pad**
   - From previous orders
   - From wishlist
   - Search and add

## Success Criteria

### Wishlist

- ✅ Users can create multiple wishlists
- ✅ Products can be added to wishlist
- ✅ Wishlists can be shared publicly
- ✅ Wishlist can be converted to order

### Comparison

- ✅ Up to 4 products can be compared
- ✅ Attributes are displayed side-by-side
- ✅ Differences are highlighted
- ✅ Products can be added to cart from comparison

### Recommendations

- ✅ Related products appear on product page
- ✅ Trending products section works
- ✅ Personalized recommendations are relevant
- ✅ "Frequently bought together" is accurate

### B2B Features

- ✅ Quote requests can be created
- ✅ Sellers receive quote notifications
- ✅ Quotes can be converted to orders
- ✅ Bulk order interface shows tiered pricing

## File Structure

### Backend Services

```
services/
├── wishlist-service/            # New microservice
│   ├── src/
│   │   ├── models/
│   │   │   └── Wishlist.ts
│   │   ├── routes/
│   │   │   └── wishlist.routes.ts
│   │   ├── controllers/
│   │   │   └── wishlist.controller.ts
│   │   └── services/
│   │       └── wishlist.service.ts
│   └── package.json
│
├── recommendation-service/       # New microservice
│   ├── src/
│   │   ├── services/
│   │   │   ├── collaborative.service.ts
│   │   │   ├── content-based.service.ts
│   │   │   └── hybrid.service.ts
│   │   └── jobs/
│   │       └── precompute.job.ts
│   └── package.json
│
└── quote-service/                # New microservice
    ├── src/
    │   ├── models/
    │   │   └── Quote.ts
    │   ├── routes/
    │   │   ├── quote.routes.ts
    │   │   └── seller-quote.routes.ts
    │   └── services/
    │       └── quote.service.ts
    └── package.json
```

### Frontend

```
web/src/
├── app/(dashboard)/
│   ├── buyer/
│   │   ├── wishlist/
│   │   │   └── page.tsx
│   │   ├── quotes/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── bulk-order/
│   │       └── page.tsx
│   └── seller/
│       └── quotes/
│           └── page.tsx
│
├── app/compare/
│   └── page.tsx                 # Comparison page
│
└── components/
    ├── wishlist/
    │   ├── WishlistButton.tsx
    │   ├── WishlistGrid.tsx
    │   └── WishlistShare.tsx
    ├── compare/
    │   ├── CompareButton.tsx
    │   ├── CompareBar.tsx
    │   └── CompareTable.tsx
    ├── recommendations/
    │   ├── RelatedProducts.tsx
    │   └── TrendingProducts.tsx
    └── product/
        └── QuickView.tsx
```

## Testing Checklist

### Wishlist

- [ ] Add product to wishlist
- [ ] Create multiple wishlists
- [ ] Move item between wishlists
- [ ] Share wishlist publicly
- [ ] Access shared wishlist
- [ ] Add wishlist item to cart

### Comparison

- [ ] Add products to comparison
- [ ] View comparison table
- [ ] Remove product from comparison
- [ ] Compare different product types
- [ ] Add to cart from comparison

### Recommendations

- [ ] View related products
- [ ] View trending products
- [ ] See personalized recommendations
- [ ] "Frequently bought together" appears
- [ ] Recommendations are relevant

### B2B Quotes

- [ ] Create quote request
- [ ] Submit quote for review
- [ ] Seller receives notification
- [ ] Seller responds to quote
- [ ] Quote converted to order

## Next Phase

After completing Phase 3, proceed to **Phase 4: Reviews & Ratings**.
