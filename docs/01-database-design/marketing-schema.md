# Marketing Schema Design

## Overview

The marketing database design covers promotions, discounts, affiliate tracking, email campaigns, and marketing analytics for the Vortex platform.

## Promotion Schema

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
    | 'bundled_discount'
    | 'tiered_discount';

  // Discount Details
  value: number; // Percentage (0-100) or fixed amount
  appliesTo:
    | 'all'
    | 'products'
    | 'categories'
    | 'brands'
    | 'collections'
    | 'customers';
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  collectionIds?: string[];
  customerSegmentIds?: string[];

  // Conditions
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  requireCoupon: boolean;
  couponCode?: string;
  couponUses?: number;
  couponMaxUses?: number;
  couponUsesPerCustomer?: number;

  // Buy X Get Y Details
  buyXGetY?: {
    buyQuantity: number;
    getQuantity: number;
    getProducts?: string[]; // Specific products or 'any'
    maxFreeItems?: number;
    discountPercent?: number;
  };

  // Bundled Discount
  bundledDiscount?: {
    requiredProductIds: string[];
    discountPercent: number;
  };

  // Tiered Discount
  tieredDiscount?: {
    tiers: Array<{
      minQuantity: number;
      discountPercent: number;
    }>;
  };

  // Customer Groups
  customerGroups: 'all' | 'new' | 'returning' | 'vip' | 'b2b';
  userSegmentIds?: string[];
  excludeSaleItems?: boolean;

  // Validity
  startDate: Date;
  endDate: Date;
  isActive: boolean;

  // Usage Limits
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;

  // Stacking
  priority: number; // Higher = applied first
  stackable: boolean; // Can combine with other promotions

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface IPromotionUsage {
  _id: string;
  promotionId: string;
  userId?: string;
  orderId: string;
  cartId?: string;
  discountAmount: number;
  currency: string;
  appliedAt: Date;

  // Context
  orderSubtotal: number;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
```

### Collection Schema

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

  // Automated Rules
  rules?: ICollectionRule[];

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

interface ICollectionRule {
  field:
    | 'category'
    | 'brand'
    | 'tag'
    | 'price'
    | 'stock'
    | 'rating'
    | 'attribute';
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'between';
  value: any;
  value2?: any; // For 'between' operator
}
```

### Coupon Schema

```typescript
interface ICoupon {
  _id: string;
  code: string; // Uppercase code
  promotionId: string; // Link to promotion

  // Usage Tracking
  totalUses: number;
  uniqueCustomers: number;

  // Distribution
  distributionMethod: 'public' | 'private' | 'email' | 'affiliate';
  distributedVia?: string[]; // Email campaigns, affiliate codes

  // Expiry
  expiresAt: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Affiliate Schema

```typescript
interface IAffiliate {
  _id: string;
  userId: string;

  // Affiliate Info
  businessName: string;
  website: string;
  description?: string;

  // Affiliate Code
  affiliateCode: string; // Unique code for tracking

  // Commission
  commissionRate: number; // Percentage of sale
  commissionTier?: string; // Tier level
  cookieDuration: number; // Days

  // Payout
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe';
  payoutInfo: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    paypalEmail?: string;
    stripeAccountId?: string;
  };

  // Status
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  approvedAt?: Date;

  // Performance
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;

  // Balance
  currentBalance: number;
  lastPayoutAt?: Date;
  nextPayoutAt?: Date;

  // Thresholds
  payoutThreshold: number; // Minimum balance for payout

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface IAffiliateTracking {
  _id: string;
  affiliateId: string;
  affiliateCode: string;

  // Click
  clickId: string;
  clickedAt: Date;
  landingPage: string;

  // Conversion
  converted: boolean;
  orderId?: string;
  orderAmount?: number;
  commission?: number;
  convertedAt?: Date;

  // Context
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}
```

### Email Campaign Schema

```typescript
interface IEmailCampaign {
  _id: string;
  name: string;
  type:
    | 'abandoned_cart'
    | 'promotion'
    | 'newsletter'
    | 'review_reminder'
    | 'welcome'
    | 'win_back';

  // Content
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;

  // Audience
  audience: {
    type: 'all' | 'segment' | 'specific';
    segmentIds?: string[];
    userIds?: string[];
    criteria?: {
      hasPurchased?: boolean;
      lastPurchaseAfter?: Date;
      lastPurchaseBefore?: Date;
      spentMinimum?: number;
      spentMaximum?: number;
      categoriesPurchased?: string[];
      tags?: string[];
    };
  };

  // Promotion
  promotionId?: string;
  couponCode?: string;

  // Scheduling
  sendAt?: Date; // null = send immediately
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
  };

  // Status
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

  // Statistics
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    complained: number;
    converted: number;
    revenue: number;
  };

  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      subject: string;
      content: string;
      traffic: number; // Percentage (0-100)
    }>;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

interface IEmailEvent {
  _id: string;
  campaignId: string;
  userId?: string;
  email: string;

  // Event
  event:
    | 'sent'
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounced'
    | 'unsubscribed'
    | 'complained'
    | 'converted';

  // Details
  timestamp: Date;
  linkClicked?: string;
  errorReason?: string;

  // Context
  userAgent?: string;
  ipAddress?: string;
}
```

### User Segment Schema

```typescript
interface IUserSegment {
  _id: string;
  name: string;
  description?: string;

  // Segment Rules
  rules: ISegmentRule[];

  // Membership
  type: 'static' | 'dynamic';
  userIds?: string[]; // For static segments

  // Usage
  usedInPromotions: string[];
  usedInCampaigns: string[];

  // Statistics
  memberCount: number;
  lastCalculatedAt: Date;

  // Status
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface ISegmentRule {
  field:
    | 'purchases_count'
    | 'total_spent'
    | 'last_purchase'
    | 'categories'
    | 'tags'
    | 'b2b_status'
    | 'registration_date';
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'not_contains'
    | 'between';
  value: any;
  value2?: any;
}
```

### SEO Metadata Schema

```typescript
interface ISEOMetadata {
  _id: string;
  entityType: 'product' | 'category' | 'brand' | 'page';
  entityId: string;

  // Page-specific
  url: string;

  // Title & Description
  title: string;
  description: string;
  keywords: string[];

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;

  // Twitter Card
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'product';

  // Structured Data
  structuredData: {
    type: 'Product' | 'Organization' | 'BreadcrumbList' | 'AggregateRating';
    data: any;
  };

  // Canonical
  canonicalUrl: string;

  // No Index
  noIndex: boolean;
  noFollow: boolean;

  // Timestamps
  updatedAt: Date;
}
```

### Marketing Analytics Schema

```typescript
interface IMarketingAnalytics {
  _id: string;
  period: {
    start: Date;
    end: Date;
  };

  // Traffic
  traffic: {
    sessions: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };

  // Sources
  sources: Array<{
    source: string;
    sessions: number;
    conversions: number;
    revenue: number;
  }>;

  // Campaigns
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
    roi: number;
  }>;

  // Affiliates
  affiliates: Array<{
    affiliateId: string;
    affiliateName: string;
    clicks: number;
    conversions: number;
    commission: number;
  }>;

  // Promotions
  promotions: Array<{
    promotionId: string;
    promotionName: string;
    uses: number;
    discountGiven: number;
    revenue: number;
    roi: number;
  }>;

  // Funnel
  funnel: {
    productViews: number;
    addToCart: number;
    checkoutStarted: number;
    orders: number;
  };

  // Email
  email: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
  };

  // SEO
  seo: {
    organicSearchTraffic: number;
    paidSearchTraffic: number;
    topKeywords: Array<{
      keyword: string;
      rank: number;
      traffic: number;
    }>;
  };

  // Calculated
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  conversionRate: number;
  avgOrderValue: number;
  customerAcquisitionCost: number;

  // Timestamps
  calculatedAt: Date;
}
```

## Promotion Examples

### Percentage Discount

```typescript
const percentagePromotion = {
  name: 'Summer Sale',
  type: 'percentage',
  value: 20, // 20% off
  appliesTo: 'categories',
  categoryIds: ['electronics', 'computers'],
  minimumOrderAmount: 50,
  requireCoupon: false,
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-30'),
  isActive: true,
  priority: 10,
  stackable: true,
};
```

### Buy X Get Y

```typescript
const buyXGetYPromotion = {
  name: 'Buy 2 Get 1 Free',
  type: 'buy_x_get_y',
  value: 100, // 100% off the free item
  appliesTo: 'products',
  productIds: ['product1', 'product2', 'product3'],
  buyXGetY: {
    buyQuantity: 2,
    getQuantity: 1,
    maxFreeItems: 1,
  },
  minimumOrderAmount: 0,
  requireCoupon: false,
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-06-30'),
  isActive: true,
};
```

### Bundled Discount

```typescript
const bundledPromotion = {
  name: 'Camera Kit Bundle',
  type: 'bundled_discount',
  value: 15, // 15% off
  bundledDiscount: {
    requiredProductIds: ['camera', 'lens', 'memory-card'],
    discountPercent: 15,
  },
  requireCoupon: true,
  couponCode: 'KIT15',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-12-31'),
  isActive: true,
};
```

### Free Shipping

```typescript
const freeShippingPromotion = {
  name: 'Free Shipping',
  type: 'free_shipping',
  value: 0, // N/A for free shipping
  minimumOrderAmount: 50,
  requireCoupon: true,
  couponCode: 'FREESHIP',
  appliesTo: 'all',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  isActive: true,
};
```

## Indexes

```javascript
// Promotion indexes
promotionSchema.index({ couponCode: 1 }, { unique: true, sparse: true });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ appliesTo: 1 });
promotionSchema.index({ priority: -1 });

// Collection indexes
collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ isActive: 1, displayOrder: 1 });
collectionSchema.index({ type: 1 });

// Affiliate indexes
affiliateSchema.index({ affiliateCode: 1 }, { unique: true });
affiliateSchema.index({ userId: 1 });
affiliateSchema.index({ status: 1 });

// Email campaign indexes
emailCampaignSchema.index({ status: 1, sendAt: 1 });
emailCampaignSchema.index({ type: 1 });

// User segment indexes
userSegmentSchema.index({ isActive: 1 });
userSegmentSchema.index({ type: 1 });
```

## Usage Examples

### Calculate Discount

```typescript
async function calculatePromotionDiscount(
  cart: ICart,
  promotion: IPromotion,
): Promise<number> {
  let discount = 0;

  // Check if promotion applies
  if (promotion.appliesTo === 'categories') {
    const cartHasCategory = cart.items.some((item) =>
      promotion.categoryIds?.includes(item.categoryId),
    );
    if (!cartHasCategory) return 0;
  }

  // Check minimum order amount
  if (promotion.minimumOrderAmount) {
    if (cart.subtotal < promotion.minimumOrderAmount) return 0;
  }

  // Calculate based on type
  switch (promotion.type) {
    case 'percentage':
      discount = cart.subtotal * (promotion.value / 100);
      break;

    case 'fixed':
      discount = promotion.value;
      break;

    case 'free_shipping':
      discount = cart.shippingCost;
      break;

    case 'buy_x_get_y':
      const applicableItems = cart.items.filter((item) =>
        promotion.productIds?.includes(item.productId),
      );
      const sets = Math.floor(
        applicableItems.reduce((sum, item) => sum + item.quantity, 0) /
          promotion.buyXGetY!.buyQuantity,
      );
      const freeItems = Math.min(
        sets * promotion.buyXGetY!.getQuantity,
        promotion.buyXGetY!.maxFreeItems || Infinity,
      );
      discount = freeItems * cart.items[0].unitPrice;
      break;
  }

  // Apply maximum discount limit
  if (promotion.maximumDiscountAmount) {
    discount = Math.min(discount, promotion.maximumDiscountAmount);
  }

  return discount;
}
```

### Validate Coupon

```typescript
async function validateCoupon(
  couponCode: string,
  cart: ICart,
  userId?: string,
): Promise<{ valid: boolean; promotion?: IPromotion; error?: string }> {
  // Find coupon
  const promotion = await Promotion.findOne({
    couponCode: couponCode.toUpperCase(),
    isActive: true,
    deletedAt: null,
  });

  if (!promotion) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  // Check dates
  const now = new Date();
  if (now < promotion.startDate || now > promotion.endDate) {
    return { valid: false, error: 'Coupon has expired' };
  }

  // Check usage limits
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  // Check per-user limit
  if (promotion.perUserLimit && userId) {
    const userUses = await PromotionUsage.countDocuments({
      promotionId: promotion._id,
      userId,
    });
    if (userUses >= promotion.perUserLimit) {
      return {
        valid: false,
        error: 'You have reached the usage limit for this coupon',
      };
    }
  }

  // Check customer group
  if (promotion.customerGroups !== 'all') {
    if (!userId) {
      return {
        valid: false,
        error: 'You must be logged in to use this coupon',
      };
    }

    const user = await User.findById(userId);
    if (!user) return { valid: false, error: 'User not found' };

    if (promotion.customerGroups === 'b2b' && !user.isB2BVerified) {
      return { valid: false, error: 'This coupon is for B2B customers only' };
    }

    if (
      promotion.customerGroups === 'new' &&
      user.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ) {
      return { valid: false, error: 'This coupon is for new customers only' };
    }
  }

  // Check if applies to cart
  const discount = await calculatePromotionDiscount(cart, promotion);
  if (discount === 0) {
    return { valid: false, error: 'Coupon does not apply to your cart' };
  }

  return { valid: true, promotion };
}
```

### Track Affiliate Click

```typescript
async function trackAffiliateClick(
  affiliateCode: string,
  req: Request,
): Promise<string> {
  const affiliate = await Affiliate.findOne({
    affiliateCode,
    status: 'approved',
  });

  if (!affiliate) {
    throw new Error('Invalid affiliate code');
  }

  // Create tracking record
  const tracking = await AffiliateTracking.create({
    affiliateId: affiliate._id,
    affiliateCode,
    clickId: generateUniqueId(),
    clickedAt: new Date(),
    landingPage: req.headers.referer || '/',
    converted: false,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  // Set cookie
  const cookieValue = Buffer.from(
    JSON.stringify({
      trackingId: tracking._id,
      affiliateId: affiliate._id,
      code: affiliateCode,
    }),
  ).toString('base64');

  return cookieValue;
}
```

### Calculate Affiliate Commission

```typescript
async function calculateAffiliateCommission(
  trackingId: string,
  orderId: string,
  orderAmount: number,
): Promise<void> {
  const tracking = await AffiliateTracking.findById(trackingId);

  if (!tracking || tracking.converted) {
    return;
  }

  const affiliate = await Affiliate.findById(tracking.affiliateId);
  if (!affiliate) return;

  // Calculate commission
  const commission = orderAmount * (affiliate.commissionRate / 100);

  // Update tracking
  tracking.converted = true;
  tracking.orderId = orderId;
  tracking.orderAmount = orderAmount;
  tracking.commission = commission;
  tracking.convertedAt = new Date();
  await tracking.save();

  // Update affiliate stats
  await Affiliate.findByIdAndUpdate(affiliate._id, {
    $inc: {
      totalConversions: 1,
      totalRevenue: orderAmount,
      totalCommission: commission,
      currentBalance: commission,
    },
  });
}
```

### Build User Segment

```typescript
async function buildUserSegment(segment: IUserSegment) {
  const query: any = {};

  for (const rule of segment.rules) {
    switch (rule.field) {
      case 'total_spent':
        if (rule.operator === 'greater_than') {
          query.totalSpent = { $gt: rule.value };
        }
        break;

      case 'last_purchase':
        if (rule.operator === 'between') {
          query.lastPurchaseDate = {
            $gte: rule.value,
            $lte: rule.value2,
          };
        }
        break;

      case 'categories':
        if (rule.operator === 'contains') {
          query['purchases.categories'] = { $in: rule.value };
        }
        break;
    }
  }

  // Find matching users
  const users = await User.find(query).distinct('_id');

  // Update segment
  await UserSegment.findByIdAndUpdate(segment._id, {
    memberCount: users.length,
    lastCalculatedAt: new Date(),
  });

  return users;
}
```
