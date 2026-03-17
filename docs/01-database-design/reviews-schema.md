# Review and Rating Schema Design

## Overview

The Review system captures customer feedback with ratings, photos, verified purchase badges, and helpful voting. Reviews are aggregated on products for display.

## Review Schema

```typescript
interface IReview {
  _id: string;
  productId: string;
  userId: string;
  orderId?: string; // Verified purchase (if linked to order)

  // Rating
  rating: number; // 1-5 stars
  title?: string; // Optional review headline
  comment: string; // Review text

  // Media
  images?: IReviewImage[]; // Customer uploaded photos

  // Verification & Recommendation
  isVerifiedPurchase: boolean; // Linked to completed order
  isRecommended: boolean; // "Would you recommend this product?"

  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged';

  // Helpful Voting
  helpfulVotes: number;
  notHelpfulVotes: number;

  // Seller Response
  sellerResponse?: {
    comment: string;
    createdAt: Date;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface IReviewImage {
  url: string;
  alt?: string;
}
```

## Review Indexes

```javascript
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ rating: 1 });
```

## Rating Aggregation

Product ratings are calculated from approved reviews:

```typescript
interface IRatingBreakdown {
  5: number; // Count of 5-star reviews
  4: number;
  3: number;
  2: number;
  1: number;
}

interface IProductRating {
  average: number; // 0-5
  count: number; // Total approved reviews
  breakdown: IRatingBreakdown;
}
```

## Usage Examples

### Creating a Review

```typescript
const review = await Review.create({
  productId: 'prod123',
  userId: 'user456',
  orderId: 'order789', // Links to completed order
  rating: 5,
  title: 'Excellent quality!',
  comment: 'The product exceeded my expectations. Highly recommend.',
  images: [{ url: 'https://cloudinary.com/review1.jpg' }],
  isVerifiedPurchase: true,
  isRecommended: true,
  status: 'pending', // Requires moderation
  helpfulVotes: 0,
  notHelpfulVotes: 0,
});

// Trigger product rating update
await updateProductRating(review.productId);
```

### Updating Product Ratings

```typescript
async function updateProductRating(productId: string) {
  const stats = await Review.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const breakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  let totalReviews = 0;
  let weightedSum = 0;

  for (const stat of stats) {
    const rating = stat._id;
    const count = stat.count;
    breakdown[rating] = count;
    totalReviews += count;
    weightedSum += rating * count;
  }

  const average = totalReviews > 0 ? weightedSum / totalReviews : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: average,
    reviewCount: totalReviews,
  });

  return { average, count: totalReviews, breakdown };
}
```

### Getting Reviews with Pagination

```typescript
async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 10,
  sort: 'recent' | 'helpful' | 'rating-high' | 'rating-low' = 'recent',
) {
  const sortMap = {
    recent: { createdAt: -1 },
    helpful: { helpfulVotes: -1 },
    'rating-high': { rating: -1 },
    'rating-low': { rating: 1 },
  };

  const reviews = await Review.find({
    productId,
    status: 'approved',
    deletedAt: null,
  })
    .populate('userId', 'name avatar')
    .sort(sortMap[sort])
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Review.countDocuments({
    productId,
    status: 'approved',
    deletedAt: null,
  });

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Helpful Voting

```typescript
async function voteHelpful(reviewId: string, userId: string, helpful: boolean) {
  // Check if user already voted (would need separate Vote collection)
  // For simplicity, just incrementing counter here

  const update = helpful
    ? { $inc: { helpfulVotes: 1 } }
    : { $inc: { notHelpfulVotes: 1 } };

  await Review.findByIdAndUpdate(reviewId, update);
}
```

### Seller Response

```typescript
async function addSellerResponse(
  reviewId: string,
  sellerId: string,
  comment: string,
) {
  await Review.findByIdAndUpdate(reviewId, {
    sellerResponse: {
      comment,
      createdAt: new Date(),
    },
  });
}
```

### Moderation Queue

```typescript
// Get pending reviews
const pendingReviews = await Review.find({
  status: 'pending',
})
  .populate('productId', 'name sellerId')
  .populate('userId', 'name email')
  .sort({ createdAt: 1 });

// Approve review
await Review.findByIdAndUpdate(reviewId, {
  status: 'approved',
});
await updateProductRating(productId);

// Reject review
await Review.findByIdAndUpdate(reviewId, {
  status: 'rejected',
});

// Flag review
await Review.findByIdAndUpdate(reviewId, {
  status: 'flagged',
  flaggedReason: 'Inappropriate content',
});
```

### Review Statistics

```typescript
async function getReviewStats(productId: string) {
  const stats = await Review.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        fiveStar: {
          $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
        },
        fourStar: {
          $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
        },
        threeStar: {
          $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
        },
        twoStar: {
          $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
        },
        oneStar: {
          $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
        },
        verifiedPurchaseCount: {
          $sum: { $cond: ['$isVerifiedPurchase', 1, 0] },
        },
        recommendedCount: {
          $sum: { $cond: ['$isRecommended', 1, 0] },
        },
        withImages: {
          $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
      verifiedPurchaseCount: 0,
      recommendedCount: 0,
      withImages: 0,
    }
  );
}
```

## Review Display on Product Page

```typescript
// Product page data
const product = await Product.findOne({ slug: 'product-slug' })
  .populate('brandId')
  .populate('primaryCategoryId');

const reviews = await getProductReviews(product._id, 1, 10);
const ratingStats = await getReviewStats(product._id);

// Display:
// - Average rating with stars
// - Review count
// - Rating distribution bar chart
// - Filter by rating (5, 4, 3, 2, 1 stars)
// - Filter by verified purchase
// - Filter by with images
// - Sort by recent/helpful/rating
```

## Verified Purchase Logic

```typescript
// Only users with completed orders can leave verified reviews
async function canLeaveVerifiedReview(userId: string, productId: string) {
  const order = await Order.findOne({
    userId,
    'items.productId': productId,
    status: 'delivered',
  });

  return !!order;
}
```

## Review Service Integration

The Review Service will:

1. Handle review CRUD operations
2. Moderate reviews (auto-approve for trusted users)
3. Update product ratings via events
4. Send notifications for new reviews
5. Handle helpful voting
6. Manage seller responses
