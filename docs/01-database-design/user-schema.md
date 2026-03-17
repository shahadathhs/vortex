# User Schema Enhancements

## Overview

The User schema has been enhanced to support addresses, B2B verification, preferences, and extended profile information needed for a complete e-commerce experience.

## Enhanced User Schema

```typescript
interface IUser {
  // Existing fields (unchanged)
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'buyer' | 'seller' | 'admin' | 'system';
  isEmailVerified: boolean;
  tfaEnabled: boolean;
  tfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;

  // New Profile Fields
  avatar?: string; // Profile picture URL
  phone?: string; // Contact phone
  dateOfBirth?: Date;

  // Address Book
  addresses: IAddress[];
  defaultAddressId?: string;

  // B2B Verification
  isB2BVerified: boolean; // Wholesale account access
  businessName?: string;
  taxId?: string; // Tax certificate / EIN
  businessType?: string; // Retailer, wholesaler, etc.
  b2bVerificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  b2bVerificationDocuments?: string[]; // URLs to uploaded documents
  b2bVerifiedAt?: Date;
  b2bApprovedBy?: string; // Admin user ID

  // Marketing & Preferences
  marketingConsent: boolean; // Email marketing consent
  preferences: IUserPreferences;

  // Seller Profile (if role === 'seller')
  sellerProfile?: ISellerProfile;

  // Timestamps
  deletedAt?: Date; // Soft delete
}

interface IUserPreferences {
  language: string; // Default: 'en'
  currency: string; // Default: 'USD'
  timezone: string; // Default: 'UTC'
  notifications: {
    email: {
      orderUpdates: boolean;
      promotions: boolean;
      newsletter: boolean;
      priceDrop: boolean;
      backInStock: boolean;
      reviewReminders: boolean;
    };
    push: {
      orderUpdates: boolean;
      promotions: boolean;
    };
    sms: {
      orderUpdates: boolean;
    };
  };
}

interface ISellerProfile {
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  businessPhone: string;
  businessEmail: string;
  website?: string;

  // Location
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;

  // Business Details
  taxId?: string;
  businessType?: string;

  // Payment
  paymentMethods: {
    bankName?: string;
    accountNumberLast4?: string;
    paypalEmail?: string;
    stripeAccountId?: string;
  };

  // Settings
  allowB2BSales: boolean; // Enable wholesale pricing
  minimumOrderQuantity?: number; // For B2B orders

  // Status
  isApproved: boolean; // Admin approved seller
  isActive: boolean;

  // Ratings
  rating: number; // Average seller rating (0-5)
  reviewCount: number;

  // Analytics
  totalProducts: number;
  totalSales: number;
}

interface IAddress {
  _id: string;

  // Contact
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;

  // Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2 (e.g., 'US')

  // Type & Defaults
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;

  // Verification (for address validation services)
  isVerified: boolean;
  verificationData?: any;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## User Indexes

```javascript
// Existing
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// New
userSchema.index(
  { 'sellerProfile.storeSlug': 1 },
  { unique: true, sparse: true },
);
userSchema.index({ isB2BVerified: 1, b2bVerificationStatus: 1 });
userSchema.index({ deletedAt: 1 });

// Search
userSchema.index({ name: 'text', email: 'text' });
```

## Address Subdocument

Addresses are embedded in the user document for optimal read performance:

```typescript
// User structure
{
  _id: "user123",
  name: "John Doe",
  email: "john@example.com",
  addresses: [
    {
      _id: "addr1",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      addressLine1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "US",
      type: "both",
      isDefault: true,
      isVerified: true
    }
  ],
  defaultAddressId: "addr1"
}
```

## B2B Verification Flow

### 1. User Submits Verification Request

```typescript
await User.findByIdAndUpdate(userId, {
  b2bVerificationStatus: 'pending',
  businessName: 'Acme Retail Inc',
  taxId: '12-3456789',
  businessType: 'retailer',
  b2bVerificationDocuments: [
    'https://cloudinary.com/tax-cert.pdf',
    'https://cloudinary.com/business-license.pdf',
  ],
});
```

### 2. Admin Reviews and Approves

```typescript
await User.findByIdAndUpdate(userId, {
  b2bVerificationStatus: 'verified',
  isB2BVerified: true,
  b2bVerifiedAt: new Date(),
  b2bApprovedBy: adminId,
});
```

### 3. B2B Benefits Unlocked

- Access to wholesale pricing tiers
- Bulk ordering interface
- Net payment terms
- Dedicated account manager
- Volume discounts

## Usage Examples

### Managing Addresses

```typescript
// Add address
const user = await User.findById(userId);
user.addresses.push({
  _id: new mongoose.Types.ObjectId(),
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+1234567890',
  addressLine1: '456 Oak Ave',
  city: 'Los Angeles',
  state: 'CA',
  postalCode: '90001',
  country: 'US',
  type: 'shipping',
  isDefault: false,
});
await user.save();

// Set default address
await User.findByIdAndUpdate(userId, {
  defaultAddressId: addressId,
});

// Update address
await User.updateOne(
  { _id: userId, 'addresses._id': addressId },
  {
    $set: {
      'addresses.$.city': 'San Francisco',
      'addresses.$.updatedAt': new Date(),
    },
  },
);

// Delete address
await User.findByIdAndUpdate(userId, {
  $pull: { addresses: { _id: addressId } },
});
```

### Seller Profile Management

```typescript
// Create seller profile
const seller = await User.findByIdAndUpdate(userId, {
  role: 'seller',
  sellerProfile: {
    storeName: 'Acme Store',
    storeSlug: 'acme-store',
    storeDescription: 'Quality products',
    businessPhone: '+1234567890',
    businessEmail: 'store@acme.com',
    country: 'US',
    state: 'CA',
    city: 'San Francisco',
    addressLine1: '123 Business St',
    postalCode: '94102',
    isApproved: false,
    isActive: false,
    rating: 0,
    reviewCount: 0,
    totalProducts: 0,
    totalSales: 0,
  },
});

// Approve seller
await User.updateOne(
  { _id: sellerId, 'sellerProfile.storeSlug': storeSlug },
  {
    $set: {
      'sellerProfile.isApproved': true,
      'sellerProfile.isActive': true,
    },
  },
);
```

### User Preferences

```typescript
// Update notification preferences
await User.findByIdAndUpdate(userId, {
  'preferences.notifications.email.orderUpdates': true,
  'preferences.notifications.email.promotions': false,
  'preferences.notifications.push.orderUpdates': true,
});

// Get users for marketing (with consent)
const targetUsers = await User.find({
  marketingConsent: true,
  'preferences.notifications.email.promotions': true,
  isEmailVerified: true,
  deletedAt: null,
});
```

## B2B Buyer Query

```typescript
// Get verified B2B buyers
const b2bBuyers = await User.find({
  role: 'buyer',
  isB2BVerified: true,
  b2bVerificationStatus: 'verified',
  deletedAt: null,
}).select('name email businessName taxId phone');

// Get pending B2B applications (for admin)
const pending = await User.find({
  b2bVerificationStatus: 'pending',
  deletedAt: null,
}).sort({ createdAt: 1 });
```

## Migration Notes

### Adding New Fields to Existing Users

```typescript
// Set default values for existing users
await User.updateMany(
  {
    marketingConsent: { $exists: false },
  },
  {
    $set: {
      marketingConsent: false,
      isB2BVerified: false,
      b2bVerificationStatus: 'none',
      preferences: {
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        notifications: {
          email: {
            orderUpdates: true,
            promotions: false,
            newsletter: false,
            priceDrop: false,
            backInStock: false,
            reviewReminders: true,
          },
          push: {
            orderUpdates: true,
            promotions: false,
          },
          sms: {
            orderUpdates: false,
          },
        },
      },
    },
  },
);
```
