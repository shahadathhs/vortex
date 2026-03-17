# Checkout & Cart API Design

## Overview

The checkout and cart API handles the complete shopping flow from adding items to cart to completing orders, supporting both guest and authenticated users, plus B2B quote requests.

## Cart API

### Guest Cart (Session-based)

```typescript
// Create/Get guest cart
POST   /api/public/guest/cart
Body: {
  sessionId?: string;             // Optional: continue existing session
}
Response: {
  cartId: string;
  sessionId: string;
  items: ICartItem[];
  subtotal: number;
}

// Add item to guest cart
POST   /api/public/guest/cart/items
Body: {
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
}

// Update guest cart item
PUT    /api/public/guest/cart/items/:itemId
Body: {
  cartId: string;
  quantity: number;
}

// Remove from guest cart
DELETE /api/public/guest/cart/items/:itemId
Body: { cartId: string }

// Apply coupon to guest cart
POST   /api/public/guest/cart/coupon
Body: {
  cartId: string;
  couponCode: string;
}

// Get guest cart
GET    /api/public/guest/cart/:cartId
```

### Authenticated Cart

```typescript
// Get user's cart
GET    /api/cart

// Add to cart
POST   /api/cart/items
Body: {
  productId: string;
  variantId?: string;
  quantity: number;
}

// Update cart item
PUT    /api/cart/items/:itemId
Body: { quantity: number }

// Remove from cart
DELETE /api/cart/items/:itemId

// Apply coupon
POST   /api/cart/coupon
Body: { couponCode: string }

// Remove coupon
DELETE /api/cart/coupon

// Merge guest cart to user cart
POST   /api/cart/merge
Body: { guestCartId: string }

// Clear cart
DELETE /api/cart
```

### Cart Response Format

```typescript
interface ICart {
  _id: string;
  userId?: string;
  sessionId?: string;
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  appliedPromotions: IPromotionSummary[];
  currency: string;
  expiresAt?: Date;
  updatedAt: Date;
}

interface ICartItem {
  _id: string;
  productId: string;
  variantId?: string;
  product: {
    name: string;
    slug: string;
    image: string;
    price: number;
    compareAtPrice?: number;
  };
  variant?: {
    name: string;
    options: Array<{ name: string; value: string }>;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  stock: number;
  available: boolean;
}

interface IPromotionSummary {
  promotionId: string;
  name: string;
  discountAmount: number;
  type: 'percentage' | 'fixed' | 'free_shipping';
}
```

## Checkout API

### Guest Checkout

```typescript
// Initiate guest checkout
POST   /api/public/guest/checkout
Body: {
  cartId: string;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: IAddressInput;
  billingAddress?: IAddressInput;  // Same as shipping if not provided
  shippingMethod: string;
  saveInfo?: boolean;              // Create account after order
  password?: string;               // If saveInfo is true
}
Response: {
  orderId: string;
  orderNumber: string;
  clientSecret: string;            // For payment intent
  amount: number;
  currency: string;
}

// Complete guest checkout (after payment)
POST   /api/public/guest/checkout/:orderId/complete
Body: {
  paymentIntentId: string;
  paymentMethod: string;
}
```

### Authenticated Checkout

```typescript
// Initiate checkout
POST   /api/checkout
Body: {
  saveAddress?: boolean;
}

// Update checkout
PATCH  /api/checkout/:checkoutId
Body: {
  shippingAddress?: IAddressInput;
  billingAddress?: IAddressInput;
  shippingMethod?: string;
  paymentMethod?: string;
}

// Apply coupon
POST   /api/checkout/:checkoutId/coupon
Body: { couponCode: string }

// Get shipping methods
GET    /api/checkout/:checkoutId/shipping-methods

// Complete checkout
POST   /api/checkout/:checkoutId/complete
Body: {
  paymentIntentId: string;
  note?: string;
}
```

### Address Input Format

```typescript
interface IAddressInput {
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type?: 'billing' | 'shipping' | 'both';
  isDefault?: boolean;
}
```

## Shipping API

```typescript
// Get available shipping methods
GET    /api/shipping/methods
Query: {
  countryCode?: string;
  postalCode?: string;
  cartValue?: number;
}
Response: {
  methods: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    estimatedDays: { min: number; max: number };
  }>;
}

// Get shipping rates
POST   /api/shipping/rates
Body: {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  destination: IAddressInput;
}
Response: {
  rates: Array<{
    methodId: string;
    name: string;
    price: number;
    estimatedDelivery: Date;
  }>;
}
```

## B2B Quote API (Buyer Side)

```typescript
// Create quote request
POST   /api/quotes
Body: {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    notes?: string;
  }>;
  customerNote?: string;
  validityDays?: number;          // Default: 30
}

// Get user's quotes
GET    /api/quotes
Query: { status?: string }

// Get quote details
GET    /api/quotes/:id

// Update draft quote
PUT    /api/quotes/:id

// Delete draft quote
DELETE /api/quotes/:id

// Submit quote for review
POST   /api/quotes/:id/submit

// Accept quote
POST   /api/quotes/:id/accept

// Reject quote
POST   /api/quotes/:id/reject
Body: { reason?: string }

// Convert quote to order
POST   /api/quotes/:id/convert-to-order
Body: {
  shippingAddress: IAddressInput;
  billingAddress?: IAddressInput;
  paymentMethod: string;
}
```

## Payment API

```typescript
// Create payment intent
POST   /api/payments/create-intent
Body: {
  orderId?: string;
  cartId?: string;
  amount: number;
  currency: string;
  paymentMethodType: 'card' | 'bank_transfer' | 'paypal';
}
Response: {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

// Confirm payment
POST   /api/payments/confirm
Body: {
  paymentIntentId: string;
  paymentMethodId: string;
}

// Get payment methods
GET    /api/payments/methods

// Add payment method
POST   /api/payments/methods
Body: {
  type: 'card';
  token: string;                  // From Stripe/Payment provider
  isDefault?: boolean;
}

// Webhook (for payment provider)
POST   /api/payments/webhook
```

## Order API

### Post-Checkout

```typescript
// Get order details
GET    /api/orders/:id

// List orders
GET    /api/orders
Query: { status?: string; page?: number; limit?: number }

// Track order
GET    /api/orders/:id/tracking

// Cancel order
POST   /api/orders/:id/cancel
Body: { reason?: string }

// Request refund
POST   /api/orders/:id/refund
Body: {
  items?: Array<{ orderId: string; quantity: number }>;
  reason: string;
}

// Reorder
POST   /api/orders/:id/reorder
Response: {
  cartId: string;
  addedItems: number;
  failedItems: Array<{
    productId: string;
    reason: string;
  }>;
}
```

## Error Responses

### Standard Error Format

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string; // For validation errors
  };
}
```

### Common Error Codes

```typescript
// Cart Errors
'CART_NOT_FOUND'; // Cart doesn't exist or expired
'CART_EXPIRED'; // Cart session expired
'ITEM_OUT_OF_STOCK'; // Requested quantity unavailable
'ITEM_NOT_AVAILABLE'; // Product or variant not found
'QUANTITY_INVALID'; // Quantity must be positive

// Checkout Errors
'CHECKOUT_EXPIRED'; // Checkout session expired
'ADDRESS_INVALID'; // Address validation failed
'SHIPPING_UNAVAILABLE'; // No shipping methods available
'PAYMENT_FAILED'; // Payment processing failed
'PAYMENT_DECLINED'; // Card declined
'COUPON_INVALID'; // Coupon code not found or expired
'COUPON_EXPIRED'; // Coupon expired
'COUPON_USAGE_LIMIT'; // Coupon usage limit reached
'COUPON_NOT_APPLICABLE'; // Coupon doesn't apply to cart

// Quote Errors
'QUOTE_EXPIRED'; // Quote no longer valid
'QUOTE_NOT_APPROVED'; // Quote not yet approved
'QUOTE_ALREADY_CONVERTED'; // Quote already converted to order

// Order Errors
'ORDER_NOT_FOUND'; // Order doesn't exist
'ORDER_ALREADY_CANCELLED'; // Order already cancelled
'ORDER_CANNOT_CANCEL'; // Order can't be cancelled (already shipped)
'REFUND_NOT_ALLOWED'; // Refund period exceeded
'REFUND_AMOUNT_EXCEEDS'; // Refund amount exceeds order total
```

## Webhooks

### Order Events

```typescript
// Order Created
{
  event: 'order.created'
  orderId: string;
  orderNumber: string;
  userId?: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

// Order Paid
{
  event: 'order.paid'
  orderId: string;
  paymentMethod: string;
  paidAt: string;
}

// Order Shipped
{
  event: 'order.shipped'
  orderId: string;
  trackingNumber: string;
  carrier: string;
  shippedAt: string;
}

// Order Delivered
{
  event: 'order.delivered'
  orderId: string;
  deliveredAt: string;
}

// Order Cancelled
{
  event: 'order.cancelled'
  orderId: string;
  reason?: string;
  cancelledAt: string;
}

// Refund Initiated
{
  event: 'refund.initiated'
  orderId: string;
  refundId: string;
  amount: number;
  reason: string;
}
```

## Integration Examples

### Complete Checkout Flow

```typescript
// 1. Add items to cart
await fetch('/api/cart/items', {
  method: 'POST',
  body: JSON.stringify({
    productId: 'prod123',
    variantId: 'var456',
    quantity: 2,
  }),
});

// 2. Apply coupon
await fetch('/api/cart/coupon', {
  method: 'POST',
  body: JSON.stringify({ couponCode: 'SAVE20' }),
});

// 3. Get shipping methods
const { methods } = await fetch(
  '/api/shipping/methods?' +
    new URLSearchParams({
      countryCode: 'US',
      postalCode: '90210',
    }),
).then((r) => r.json());

// 4. Initiate checkout
const { orderId, clientSecret } = await fetch('/api/checkout', {
  method: 'POST',
}).then((r) => r.json());

// 5. Confirm payment with Stripe
const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'John Doe' },
  },
});

// 6. Complete checkout
await fetch('/api/checkout/complete', {
  method: 'POST',
  body: JSON.stringify({
    paymentIntentId: paymentIntent.id,
  }),
});
```

### Guest Checkout Flow

```typescript
// 1. Create guest cart
const { cartId, sessionId } = await fetch('/api/public/guest/cart', {
  method: 'POST',
  body: JSON.stringify({}),
}).then((r) => r.json());

// 2. Add items
await fetch('/api/public/guest/cart/items', {
  method: 'POST',
  body: JSON.stringify({
    cartId,
    productId: 'prod123',
    quantity: 1,
  }),
});

// 3. Initiate guest checkout
const { orderId, clientSecret } = await fetch('/api/public/guest/checkout', {
  method: 'POST',
  body: JSON.stringify({
    cartId,
    customerInfo: {
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'User',
      phone: '+1234567890',
    },
    shippingAddress: {
      firstName: 'Guest',
      lastName: 'User',
      phone: '+1234567890',
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    shippingMethod: 'standard',
    saveInfo: false,
  }),
}).then((r) => r.json());

// 4-6. Same payment flow as authenticated
```

### Quote to Order Flow

```typescript
// 1. Create quote
const { quoteId } = await fetch('/api/quotes', {
  method: 'POST',
  body: JSON.stringify({
    items: [{
      productId: 'prod123',
      quantity: 100,
      notes: 'Need white color'
    }],
    customerNote: 'Bulk order for Q1',
    validityDays: 30
  })
}).then(r => r.json());

// 2. Wait for seller approval...

// 3. Once approved, convert to order
const { orderId } = await fetch(`/api/quotes/${quoteId}/convert-to-order`, {
  method: 'POST',
  body: JSON.stringify({
    shippingAddress: {...},
    billingAddress: {...},
    paymentMethod: 'net_30'
  })
}).then(r => r.json());

// 4. Complete payment (if not Net terms)
```

## Rate Limiting

```
/api/cart/*                : 100 requests/hour per user
/api/checkout/*            : 20 requests/hour per user
/api/public/guest/*        : 50 requests/hour per IP
/api/payments/*            : 10 requests/hour per user
/api/quotes/*              : 20 requests/hour per user
```

## Caching

```
GET /api/shipping/methods   : Cache 5 minutes
GET /api/cart               : No cache (real-time)
GET /api/orders/:id         : Cache 1 minute
```
