# User Flow Architecture

## Overview

This document outlines the complete user flows for both B2C (consumer) and B2B (wholesale) customers on the Vortex platform.

## B2C Customer Flow

### Guest to Purchase Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      GUEST USER                              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Landing Page  │ ─────► Browse Categories ─────► Featured Products
└─────────────────┘
         │
         ▼
┌─────────────────┐    Search    ┌─────────────────┐
│  Browse Shop    │ ───────────► │ Search Results   │
└─────────────────┘             └─────────────────┘
         │
         ├──────────────────────────┐
         ▼                          ▼
┌─────────────────┐       ┌─────────────────┐
│  Filter by:     │       │  View Product   │
│  - Category     │       │  Details        │
│  - Brand        │       └─────────────────┘
│  - Price Range  │                │
│  - Rating       │                ├──────────┬────────────┐
│  - Tags         │                ▼          ▼            ▼
└─────────────────┘         ┌────────────┐ ┌─────────┐ ┌──────────┐
                            │Add to List │ │Compare  │ │Add to    │
                            │  Wishlist  │ │Products │ │Cart      │
                            └────────────┘ └─────────┘ └──────────┘
                                 │            │            │
                                 └────────────┴────────────┘
                                              ▼
                                   ┌─────────────────────┐
                                   │   Shopping Cart      │
                                   │ - Review Items       │
                                   │ - Apply Coupon       │
                                   │ - Update Quantity    │
                                   └─────────────────────┘
                                              │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                               ▼
            ┌───────────────┐                              ┌───────────────┐
            │  Guest Checkout│                              │   Sign Up /    │
            └───────────────┘                              │   Login        │
                    │                                       └───────────────┘
                    ▼                                               │
        ┌──────────────────┐                                     ▼
        │ Shipping Info    │                          ┌─────────────────────┐
        │ - Email          │                          │   Customer Account   │
        │ - Name           │                          │ - Order History      │
        │ - Address        │                          │ - Saved Addresses    │
        │ - Phone          │                          │ - Wishlist           │
        └──────────────────┘                          │ - Profile Settings   │
                    │                                   └─────────────────────┘
                    ▼                                               │
        ┌──────────────────┐                                     ▼
        │ Payment Method   │                          ┌─────────────────────┐
        │ - Card           │                          │   Continue Shopping  │
        │ - PayPal         │                          └─────────────────────┘
        │ - Apple Pay      │
        └──────────────────┘
                    │
                    ▼
        ┌──────────────────┐
        │ Order Confirmation│
        │ - Order Number   │
        │ - Email Sent      │
        └──────────────────┘
                    │
                    ▼
        ┌──────────────────┐
        │ Order Tracking   │
        │ - Status Updates │
        │ - Tracking Info  │
        └──────────────────┘
```

### Detailed Guest Checkout Flow

```typescript
// 1. Browse Products
GET /shop → View products
GET /shop?category=electronics → Filter by category
GET /shop?minPrice=50&maxPrice=200 → Price range filter
GET /shop?sort=price&order=asc → Sort by price

// 2. View Product
GET /product/wireless-headphones → Product details
POST /api/public/guest/cart/items → Add to cart

// 3. Shopping Cart
GET /api/public/guest/cart/:cartId → View cart
PUT /api/public/guest/cart/items/:itemId → Update quantity
DELETE /api/public/guest/cart/items/:itemId → Remove item
POST /api/public/guest/cart/coupon → Apply coupon

// 4. Guest Checkout Initiation
POST /api/public/guest/checkout
Body: {
  cartId: string;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: IAddressInput;
  billingAddress?: IAddressInput;
  shippingMethod: string;
  saveInfo?: boolean;        // Create account after order
  password?: string;
}
Response: {
  orderId: string;
  orderNumber: string;
  clientSecret: string;      // For Stripe
}

// 5. Payment Processing
// Use Stripe.js with clientSecret
const stripe = Stripe(STRIPE_KEY);
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  { payment_method: { card: cardElement } }
);

// 6. Complete Order
POST /api/public/guest/checkout/:orderId/complete
Body: { paymentIntentId: string }

// 7. Order Tracking
GET /api/orders/:orderNumber/tracking
```

### Authenticated User Flow

```typescript
// 1. User Registration/Login
POST /api/auth/register
Body: {
  name: string;
  email: string;
  password: string;
}
Response: { user: IUser; token: string }

// 2. Browse & Add to Cart
// Same as guest flow but uses authenticated endpoints

// 3. Cart Management
GET /api/cart → View cart (synced across devices)
POST /api/cart/items → Add to cart
PUT /api/cart/items/:id → Update quantity

// 4. Checkout Flow
POST /api/checkout → Initiate checkout
GET /api/user/addresses → Get saved addresses
GET /api/checkout/:id/shipping-methods → Get shipping options

// 5. Complete Order
POST /api/checkout/:id/complete

// 6. Order Management
GET /api/orders → View order history
GET /api/orders/:id → Order details
POST /api/orders/:id/reorder → Reorder items
```

## B2B Customer Flow

### B2B Verification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    POTENTIAL B2B BUYER                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Register      │ ─────► Create Account
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Account Setup  │ ─────► Complete Profile
└─────────────────┘
         │
         ▼
┌─────────────────┐
│B2B Verification │ ─────► Submit Business Info
│  Request        │         - Business Name
└─────────────────┘         - Tax ID
         │                  - Business License
         ▼
┌─────────────────┐
│  Admin Review   │ ─────► Platform Admin reviews
└─────────────────┘
         │
         ├─────────────────┬──────────────────┐
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  APPROVED    │  │   REJECTED   │  │  MORE INFO   │
└──────────────┘  └──────────────┘  └──────────────┘
      │                                   │
      ▼                                   ▼
┌──────────────┐                  ┌──────────────┐
│Access B2B    │                  │Submit More   │
│Pricing       │                  │Documents     │
└──────────────┘                  └──────────────┘
```

### B2B Quote Flow

```typescript
// 1. Browse Products (with wholesale prices)
GET /shop
Response: {
  products: [{
    ...product,
    b2bPricing: {
      enabled: true,
      tiers: [
        { minQuantity: 10, discountPercent: 10 },
        { minQuantity: 50, discountPercent: 20 },
        { minQuantity: 100, discountPercent: 30 }
      ]
    }
  }]
}

// 2. Create Quote Request
POST /api/quotes
Body: {
  items: [
    {
      productId: string;
      variantId?: string;
      quantity: 100;
      notes?: string;
    }
  ];
  customerNote?: string;
  validityDays?: number;
}
Response: {
  quoteId: string;
  quoteNumber: string;
  status: 'pending';
}

// 3. Quote Received by Seller
GET /api/seller/quotes
Response: {
  quotes: [{
    id: string;
    customerName: string;
    businessName: string;
    items: IQuoteItem[];
    total: number;
    status: 'pending';
    createdAt: Date;
  }]
}

// 4. Seller Responds
PATCH /api/seller/quotes/:quoteId/status
Body: {
  status: 'approved';
  sellerNote?: string;
  revisedItems?: Array<{
    itemId: string;
    unitPrice: number;
    estimatedLeadTime: string;
  }>;
  validUntil: Date;
  paymentTerms: string;
}

// 5. Buyer Views Quote
GET /api/quotes/:quoteId
Response: {
  quote: IQuote;
  sellerResponse: {
    approvedAt: Date;
    revisedPricing: Array<{...}>;
    validUntil: Date;
    paymentTerms: 'Net 30';
  };
}

// 6. Buyer Accepts Quote
POST /api/quotes/:quoteId/accept

// 7. Convert Quote to Order
POST /api/quotes/:quoteId/convert-to-order
Body: {
  shippingAddress: IAddressInput;
  billingAddress?: IAddressInput;
  paymentMethod: 'net_30' | 'bank_transfer';
}
Response: {
  orderId: string;
  orderNumber: string;
}
```

### B2B Bulk Order Flow

```typescript
// 1. Access Bulk Order Interface
GET /dashboard/buyer/bulk-order

// 2. Select Products
POST /api/products/bulk-order/list
Body: {
  category?: string;
  search?: string;
}
Response: {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    b2bTiers: Array<{
      minQty: number;
      discount: number;
      price: number;
    }>;
  }>;
}

// 3. Set Quantities
POST /api/cart/bulk-items
Body: {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}
Response: {
  cart: ICart;
  appliedTieredDiscounts: Array<{
    productId: string;
    tier: { minQty: number; discount: number };
    discountAmount: number;
  }>;
}

// 4. Review and Checkout
// Same as B2C flow but with Net payment terms
POST /api/checkout
Body: {
  paymentMethod: 'net_30' | 'net_60';
  purchaseOrderNumber?: string;  // For B2B
}
```

## Cart State Management

### Cart States

```typescript
type CartState =
  | 'empty' // No items
  | 'active' // Has items, not checked out
  | 'abandoned' // Has items, session expired
  | 'converting' // Converting to order
  | 'converted'; // Successfully converted to order

interface ICart {
  id: string;
  userId?: string; // Authenticated user
  sessionId?: string; // Guest session
  state: CartState;
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  appliedPromotions: IPromotion[];
  currency: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Guest to User Cart Merge

```typescript
// When guest user logs in, merge their cart
POST / api / cart / merge;
Body: {
  guestCartId: string;
}

// Logic:
// 1. Get guest cart items
// 2. Get user's existing cart
// 3. Merge items (combine quantities for same product/variant)
// 4. Apply promotions to merged cart
// 5. Delete guest cart
// 6. Return merged cart

Response: {
  mergedCart: ICart;
  addedItems: number;
  conflictItems: Array<{
    // Items that existed in both
    productId: string;
    guestQuantity: number;
    userQuantity: number;
    finalQuantity: number;
  }>;
}
```

## Checkout States

### Order State Machine

```typescript
type OrderStatus =
  | 'pending' // Order created, awaiting payment
  | 'processing' // Payment received, preparing
  | 'confirmed' // Payment confirmed
  | 'production' // Being manufactured (B2B)
  | 'ready_to_ship' // Ready for pickup
  | 'shipped' // Shipped
  | 'out_for_delivery' // Out for delivery
  | 'delivered' // Delivered
  | 'cancelled' // Cancelled
  | 'refunded' // Refunded
  | 'returned'; // Returned

interface IOrderState {
  status: OrderStatus;
  canCancel: boolean;
  canReturn: boolean;
  canRefund: boolean;
  nextStates: OrderStatus[];
}

const orderStateTransitions: Record<OrderStatus, IOrderState> = {
  pending: {
    status: 'pending',
    canCancel: true,
    canReturn: false,
    canRefund: false,
    nextStates: ['processing', 'cancelled'],
  },
  processing: {
    status: 'processing',
    canCancel: true,
    canReturn: false,
    canRefund: false,
    nextStates: ['confirmed', 'cancelled'],
  },
  // ... other states
};
```

### Payment States

```typescript
type PaymentStatus =
  | 'pending' // Awaiting payment
  | 'processing' // Payment being processed
  | 'paid' // Payment successful
  | 'failed' // Payment failed
  | 'partially_refunded' // Partial refund
  | 'refunded' // Full refund
  | 'disputed'; // Chargeback/dispute

interface IPaymentState {
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'paypal' | 'net_30' | 'net_60';
  transactionId?: string;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}
```

## Session Management

### Guest Session

```typescript
// Create guest session on first visit
POST / api / session / guest;
Response: {
  sessionId: string;
  expiresAt: Date;
}

// Session stored in cookie
// Used for:
// - Cart persistence
// - Recently viewed
// - Compare products
// - Wishlist (temporary)

// Extend session
POST / api / session / extend;
Body: {
  sessionId: string;
}
```

### User Session

```typescript
// Authenticated session
// JWT token stored in httpOnly cookie
// Contains: userId, email, role

// Refresh token
POST / api / auth / refresh;
Response: {
  token: string;
  expiresIn: number;
}
```

## Error States

### Checkout Errors

```typescript
interface CheckoutError {
  code:
    | 'CART_EXPIRED'
    | 'ITEM_OUT_OF_STOCK'
    | 'PAYMENT_DECLINED'
    | 'SHIPPING_UNAVAILABLE'
    | 'ADDRESS_INVALID'
    | 'COUPON_EXPIRED'
    | 'COUPON_USAGE_LIMIT';
  message: string;
  recoverable: boolean;
  action?: string;
}

// Example:
{
  code: 'ITEM_OUT_OF_STOCK',
  message: 'Sorry, this item is now out of stock',
  recoverable: true,
  action: 'remove_item_or_continue_without'
}
```

## Analytics Events

### Tracking Events

```typescript
// Page View
{
  event: 'page_view',
  page: '/shop',
  userId?: string,
  sessionId: string,
}

// Product View
{
  event: 'product_view',
  productId: string,
  productName: string,
  category: string,
  price: number,
  userId?: string,
  sessionId: string,
}

// Add to Cart
{
  event: 'add_to_cart',
  productId: string,
  variantId?: string,
  quantity: number,
  price: number,
  userId?: string,
  sessionId: string,
}

// Remove from Cart
{
  event: 'remove_from_cart',
  cartItemId: string,
  productId: string,
  userId?: string,
}

// Checkout Started
{
  event: 'checkout_started',
  cartId: string,
  itemCount: number,
  subtotal: number,
  userId?: string,
}

// Coupon Applied
{
  event: 'coupon_applied',
  couponCode: string,
  discountAmount: number,
  userId?: string,
}

// Payment Completed
{
  event: 'payment_completed',
  orderId: string,
  orderNumber: string,
  total: number,
  paymentMethod: string,
  userId?: string,
}

// Order Completed
{
  event: 'order_completed',
  orderId: string,
  orderNumber: string,
  total: number,
  itemCount: number,
  userId?: string,
}
```

## Abandoned Cart Recovery

### Recovery Flow

```typescript
// 1. Cart abandonment detected (after 30 min)
// Scheduled job checks for carts with state: 'active'
// and updatedAt > 30 minutes ago

// 2. Send recovery email
POST /api/email/cart-recovery
Body: {
  cartId: string;
  email: string;
  recoveryLink: string; // Link to restore cart
}

// 3. User clicks recovery link
GET /cart/recover?token=xxx
// Restores cart and redirects to checkout

// 4. Conversion tracking
{
  event: 'cart_recovered',
  cartId: string,
  abandonedAt: Date;
  recoveredAt: Date,
  timeToRecover: number, // minutes
}
```

## Redirect Flows

### Post-Auth Redirect

```typescript
// Save intended destination before auth
const searchParams = useSearchParams();
const redirectTo = searchParams.get('redirect') || '/dashboard';

// After login, redirect to intended page
router.push(redirectTo);

// Example flows:
// /shop → /login?redirect=/shop → after login → /shop
// /checkout → /login?redirect=/checkout → after login → /checkout
```

### Post-Checkout Redirect

```typescript
// After successful checkout
// 1. Show confirmation page
router.push(`/orders/${orderNumber}/confirmation`);

// 2. Order tracking page
router.push(`/orders/${orderNumber}`);

// 3. Continue shopping
router.push('/shop');
```
