# Order Schema Design

## Overview

The Order schema has been significantly enhanced to support both B2C (consumer) and B2B (wholesale) flows, with support for guest checkout, multiple payment methods, order tracking, and detailed fulfillment workflows.

## Complete Schema

### Order Schema

```typescript
interface IOrder {
  // Identifiers
  _id: string;
  orderNumber: string; // Human-readable (e.g., ORD-2024-001234)

  // Customer Information
  userId?: string; // Registered user (null for guest)
  guestEmail?: string; // Guest customer email
  guestName?: {
    // Guest customer name
    firstName: string;
    lastName: string;
  };

  // B2B Information
  isB2B: boolean;
  businessName?: string; // For B2B orders
  purchaseOrderNumber?: string; // PO number for B2B
  quoteId?: string; // Converted from quote

  // Order Items
  items: IOrderItemEnhanced[];

  // Financials
  subtotal: number; // Items total
  discountAmount: number; // Total discounts
  discountCode?: string; // Applied coupon code
  taxAmount: number; // Total tax
  shippingCost: number; // Shipping cost
  total: number; // Final total
  currency: string; // Default: USD

  // Addresses
  shippingAddress: IAddress;
  billingAddress: IAddress;

  // Shipping
  shippingMethod: {
    id: string;
    name: string;
    description?: string;
  };
  estimatedDelivery?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;

  // Payment
  paymentMethod: string; // 'card', 'paypal', 'bank_transfer', 'net_30', 'net_60'
  paymentStatus:
    | 'pending'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';
  paymentDetails?: {
    transactionId?: string;
    paidAt?: Date;
    failedAt?: Date;
    failureReason?: string;
    refundAmount?: number;
    refundedAt?: Date;
    refundReason?: string;
  };

  // Order Status
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'production'
    | 'ready_to_ship'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
    | 'returned';
  statusHistory: IOrderStatusEvent[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Additional Info
  customerNote?: string; // Note from customer
  sellerNotes?: string; // Internal notes
  source: 'web' | 'mobile' | 'admin' | 'api';
  affiliateCode?: string; // Affiliate tracking
  campaign?: string; // Marketing campaign

  // Analytics
  channel?:
    | 'organic'
    | 'paid_search'
    | 'social'
    | 'email'
    | 'direct'
    | 'referral';
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

interface IOrderItemEnhanced {
  _id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productSlug: string;
  variantName?: string;

  // Product Info (snapshot)
  productImage: string;
  category: string;

  // Pricing
  unitPrice: number; // Price per unit
  compareAtPrice?: number; // Original price
  discountAmount: number; // Discount per unit
  tax: number; // Tax per unit
  total: number; // Total for this line item

  // Quantity
  quantity: number;
  unit: string; // 'pcs', 'kg', 'meters', etc.

  // Seller Info
  sellerId: string;
  sellerName: string;

  // Fulfillment
  fulfillmentStatus:
    | 'pending'
    | 'fulfilled'
    | 'shipped'
    | 'delivered'
    | 'returned';
  quantityFulfilled: number;

  // B2B Pricing
  b2bPricing?: {
    basePrice: number;
    tierDiscount: number; // Applied tier discount %
    finalPrice: number;
  };
}

interface IOrderStatusEvent {
  status: string;
  timestamp: Date;
  userId?: string; // Who changed the status
  note?: string;
  location?: string; // For shipped/delivered
}

interface IAddress {
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2
  type: 'billing' | 'shipping';
}
```

### Order Indexes

```javascript
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ guestEmail: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ quoteId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.sellerId': 1 });

// Compound indexes
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, paymentStatus: 1 });
```

## Guest Order Support

### Guest Customer Schema

```typescript
interface IGuestCustomer {
  _id: string;

  // Contact Info
  email: string;
  firstName: string;
  lastName: string;
  phone: string;

  // Order Reference
  orderId: string;

  // Account Creation
  createAccount?: boolean;
  password?: string; // If user wants to create account

  // Timestamps
  createdAt: Date;
}
```

### Guest to User Conversion

```typescript
// When guest places order with createAccount = true
interface IGuestConversion {
  guestId: string;
  userId: string;
  convertedAt: Date;
  originalOrderId: string;
}
```

## B2B Order Enhancements

### B2B Order Schema

```typescript
interface IB2BOrderEnhancements extends IOrder {
  // B2B Specific
  paymentTerms: 'standard' | 'net_30' | 'net_60' | 'net_90';
  creditApproved: boolean;
  creditLimit?: number;

  // Quote Conversion
  quoteId?: string;
  quoteNumber?: string;

  // Bulk Order
  isBulkOrder: boolean;
  bulkOrderItems?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    appliedTier: {
      minQuantity: number;
      discountPercent: number;
    };
  }>;

  // Approval Workflow
  approvalStatus: 'not_required' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  // Volume Discounts
  appliedVolumeDiscounts: Array<{
    name: string;
    discountAmount: number;
  }>;

  // Shipping & Delivery
  requestedDeliveryDate?: Date;
  productionTime?: number; // Days
  shippingAccount?: string; // Customer's shipping account
}
```

## Order Fulfillment

### Fulfillment Schema

```typescript
interface IOrderFulfillment {
  _id: string;
  orderId: string;

  // Items
  items: Array<{
    orderItemId: string;
    quantity: number;
  }>;

  // Shipping
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  shippedAt: Date;
  estimatedDelivery: Date;

  // Location
  shippedFrom: {
    warehouseId: string;
    address: IAddress;
  };

  // Documents
  shippingLabel?: string; // URL to label
  packingSlip?: string; // URL to packing slip

  // Status
  status: 'pending' | 'in_transit' | 'delivered' | 'returned';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Shipping Label

```typescript
interface IShippingLabel {
  orderId: string;
  fulfillmentId: string;

  // Label Data
  labelUrl: string; // URL to PDF label
  trackingNumber: string;
  carrier: string;

  // Package Details
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };

  // Service
  service: string; // 'ground', 'express', etc.

  // Cost
  shipCost: number;

  // Created
  createdAt: Date;
}
```

## Order Returns

### Return Schema

```typescript
interface IReturn {
  _id: string;
  returnNumber: string; // RMA-2024-001234

  // Order Reference
  orderId: string;
  orderNumber: string;

  // Customer
  userId?: string;
  guestEmail?: string;

  // Items Being Returned
  items: Array<{
    orderItemId: string;
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    condition: 'new' | 'used' | 'damaged';
  }>;

  // Return Reason
  reason: string;
  description?: string;

  // Resolution
  resolution: 'refund' | 'exchange' | 'store_credit';
  refundAmount?: number;
  exchangeItems?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;

  // Status
  status:
    | 'requested'
    | 'approved'
    | 'in_transit'
    | 'received'
    | 'processing'
    | 'completed'
    | 'rejected';

  // Shipping
  returnShippingMethod: string;
  trackingNumber?: string;
  returnLabel?: string; // URL to return label

  // Resolution Details
  resolvedAt?: Date;
  resolvedBy?: string;
  rejectionReason?: string;

  // Refund
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;

  // Timestamps
  requestedAt: Date;
  approvedAt?: Date;
  receivedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Order Analytics

### Order Statistics Schema

```typescript
interface IOrderStatistics {
  // Period
  period: {
    start: Date;
    end: Date;
  };

  // Counts
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;

  // Revenue
  totalRevenue: number;
  refundedAmount: number;
  netRevenue: number;

  // Averages
  averageOrderValue: number;
  averageItemsPerOrder: number;

  // Breakdown
  revenueByCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    orders: number;
  }>;

  revenueBySeller: Array<{
    sellerId: string;
    sellerName: string;
    revenue: number;
    orders: number;
  }>;

  // B2B vs B2C
  b2cOrders: number;
  b2cRevenue: number;
  b2bOrders: number;
  b2bRevenue: number;

  // Payment Methods
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;

  // Status Breakdown
  statusBreakdown: Array<{
    status: string;
    count: number;
    amount: number;
  }>;

  // Updated
  updatedAt: Date;
}
```

## Usage Examples

### Creating an Order

```typescript
const order = await Order.create({
  orderNumber: await generateOrderNumber(),
  userId: user?.id,
  guestEmail: guest?.email,
  guestName: guest
    ? {
        firstName: guest.firstName,
        lastName: guest.lastName,
      }
    : undefined,
  isB2B: false,
  items: cart.items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    productName: item.product.name,
    productSlug: item.product.slug,
    variantName: item.variant?.name,
    productImage: item.product.images[0]?.url,
    category: item.product.category,
    unitPrice: item.price,
    discountAmount: item.discountAmount || 0,
    tax: item.tax,
    total: item.total,
    quantity: item.quantity,
    unit: 'pcs',
    sellerId: item.product.sellerId,
    sellerName: item.product.seller?.name,
    fulfillmentStatus: 'pending',
  })),
  subtotal: cart.subtotal,
  discountAmount: cart.discountAmount,
  discountCode: cart.couponCode,
  taxAmount: cart.taxAmount,
  shippingCost: cart.shippingCost,
  total: cart.total,
  currency: 'USD',
  shippingAddress: shippingAddress,
  billingAddress: billingAddress,
  shippingMethod: shippingMethod,
  paymentMethod: paymentMethod,
  paymentStatus: 'pending',
  status: 'pending',
  statusHistory: [
    {
      status: 'pending',
      timestamp: new Date(),
      note: 'Order created',
    },
  ],
  source: 'web',
  customerNote: customerNote,
  createdAt: new Date(),
});
```

### B2B Order from Quote

```typescript
const b2bOrder = await Order.create({
  ...baseOrder,
  orderNumber: await generateOrderNumber(),
  isB2B: true,
  businessName: quote.businessName,
  purchaseOrderNumber: purchaseOrderNumber,
  quoteId: quote.id,
  quoteNumber: quote.quoteNumber,
  paymentTerms: quote.paymentTerms || 'net_30',
  isBulkOrder: true,
  bulkOrderItems: quote.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    appliedTier: item.appliedTier,
  })),
  approvalStatus: 'not_required', // Already approved with quote
  appliedVolumeDiscounts: quote.appliedPromotions || [],
  requestedDeliveryDate: quote.requestedDeliveryDate,
});
```

### Updating Order Status

```typescript
async function updateOrderStatus(
  orderId: string,
  newStatus: IOrder['status'],
  userId?: string,
  note?: string,
) {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Validate status transition
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready_to_ship', 'production', 'cancelled'],
    production: ['ready_to_ship'],
    ready_to_ship: ['shipped'],
    shipped: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
    refunded: [],
    returned: [],
  };

  if (!validTransitions[order.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  // Add status history
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    userId,
    note,
  });

  order.status = newStatus;

  // Special handling for shipped
  if (newStatus === 'shipped') {
    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    order.carrier = carrier;
  }

  await order.save();

  // Trigger notifications
  await sendOrderStatusNotification(order);

  return order;
}
```

### Guest to Customer Conversion

```typescript
// When guest user registers after order
async function convertGuestOrderToUser(orderId: string, userId: string) {
  const order = await Order.findOne({
    _id: orderId,
    userId: { $exists: false },
  });

  if (!order) {
    throw new Error('Order not found or already linked');
  }

  // Update order with user
  order.userId = userId;
  order.guestEmail = undefined;
  order.guestName = undefined;

  await order.save();

  // Create conversion record
  await GuestConversion.create({
    guestId: order.guestEmail,
    userId,
    convertedAt: new Date(),
    originalOrderId: orderId,
  });

  return order;
}
```

### Order Lookup

```typescript
// Get order by order number (public facing)
async function getOrderByNumber(orderNumber: string) {
  const order = await Order.findOne({ orderNumber })
    .populate('userId', 'name email')
    .populate('items.sellerId', 'name email');

  // Verify access
  if (order.userId) {
    // User must be logged in and own the order
    // Check in middleware
  } else {
    // Guest order - verify by email
    // Check in middleware
  }

  return order;
}
```

### Order Search (Seller)

```typescript
async function getSellerOrders(
  sellerId: string,
  filters: {
    status?: string;
    paymentStatus?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  },
) {
  const query: any = {
    'items.sellerId': sellerId,
  };

  // Build filters
  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  if (filters.search) {
    query.$or = [
      { orderNumber: { $regex: filters.search, $options: 'i' } },
      {
        'shippingAddress.firstName': { $regex: filters.search, $options: 'i' },
      },
      { 'shippingAddress.lastName': { $regex: filters.search, $options: 'i' } },
      { guestEmail: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}
```

## Migration from Old Schema

```typescript
// Old Order schema (minimal)
interface IOrderOld {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

// Migration Steps
// 1. Add new fields with defaults
await Order.updateMany(
  {},
  {
    $set: {
      orderNumber: { $concat: ['ORD-', { $toString: '$_id' }] },
      currency: 'USD',
      paymentStatus: 'pending',
      shippingCost: 0,
      discountAmount: 0,
      taxAmount: 0,
      subtotal: '$total',
      isB2B: false,
    },
  },
);

// 2. Transform items to enhanced format
await Order.updateMany({ 'items.0': { $exists: true } }, [
  {
    $set: {
      items: {
        $map: {
          input: '$items',
          as: 'item',
          in: {
            productId: '$$item.productId',
            variantId: null,
            productName: 'Product', // Need to populate from Product service
            productSlug: 'product',
            unitPrice: '$$item.price',
            discountAmount: 0,
            tax: 0,
            total: { $multiply: ['$$item.price', '$$item.quantity'] },
            quantity: '$$item.quantity',
            unit: 'pcs',
            productImage: '/placeholder.jpg',
            category: 'uncategorized',
            sellerId: null,
            sellerName: 'Seller',
            fulfillmentStatus: 'pending',
          },
        },
      },
    },
  },
]);
```
