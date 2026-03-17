# Phase 4: Reviews & Ratings System

## Overview

Phase 4 implements a comprehensive review and rating system with photo uploads, moderation, helpful voting, seller responses, and verified purchase badges.

## Objectives

- [ ] Create Review microservice
- [ ] Implement review submission (with photos)
- [ ] Build review moderation dashboard
- [ ] Add helpful voting system
- [ ] Enable seller responses
- [ ] Show verified purchase badges
- [ ] Implement review aggregation on products
- [ ] Add review search and filtering

## Database Schema

### Review Schema (Detailed)

```typescript
interface IReview {
  _id: string;
  productId: string;
  userId: string;
  orderId?: string; // Link to completed order

  // Review Content
  rating: number; // 1-5 stars (required)
  title?: string; // Optional headline
  comment: string; // Review text (required)

  // Media
  images?: IReviewImage[]; // Customer uploaded photos
  videos?: IReviewVideo[];

  // Verification
  isVerifiedPurchase: boolean; // Linked to completed order
  isRecommended: boolean; // "Would you recommend?"

  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'archived';
  moderationNote?: string; // Internal note
  flaggedReason?: string;
  moderatedBy?: string; // Admin user ID
  moderatedAt?: Date;

  // Engagement
  helpfulVotes: number;
  notHelpfulVotes: number;
  votedUserIds?: {
    helpful: string[];
    notHelpful: string[];
  };

  // Seller Response
  sellerResponse?: {
    comment: string;
    createdAt: Date;
    updatedAt?: Date;
    responderId?: string; // Seller user ID
  };

  // Product Context (snapshot at time of review)
  productSnapshot?: {
    name: string;
    image: string;
    variantName?: string;
  };

  // User Context (for deleted accounts)
  userSnapshot?: {
    name: string;
    avatar?: string;
  };

  // Reporting
  reports?: IReviewReport[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface IReviewImage {
  _id: string;
  url: string;
  alt?: string;
  position: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface IReviewVideo {
  _id: string;
  url: string;
  thumbnail: string;
  duration?: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface IReviewReport {
  reportedBy: string;
  reason: string;
  note?: string;
  reportedAt: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  action?: 'kept' | 'removed';
}
```

**Indexes:**

```javascript
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ status: 1, createdAt: 1 }); // For moderation queue
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ helpfulVotes: -1 });
reviewSchema.index({ 'sellerResponse.createdAt': -1 });
```

### Review Aggregation Cache

```typescript
interface IReviewStats {
  _id: string; // productId
  productId: string;

  // Overall
  averageRating: number;
  totalReviews: number;

  // Rating Distribution
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  // Breakdowns
  verifiedPurchaseStats: {
    count: number;
    averageRating: number;
  };

  // Recent Activity
  lastReviewAt?: Date;
  reviewsThisMonth: number;
  reviewsThisYear: number;

  // Updated via events
  updatedAt: Date;
}
```

## API Design

### Customer Review Endpoints

```typescript
// Review CRUD
GET    /api/reviews                    # Get reviews (with filters)
GET    /api/reviews/:id                # Get review by ID
POST   /api/reviews                    # Submit review
PUT    /api/reviews/:id                # Update own review (only if pending)
DELETE /api/reviews/:id                # Delete own review

// Product Reviews
GET    /api/products/:productId/reviews # Get reviews for product
GET    /api/products/:productId/reviews/stats # Get review statistics

// Engagement
POST   /api/reviews/:id/helpful        # Mark as helpful
POST   /api/reviews/:id/not-helpful    # Mark as not helpful
POST   /api/reviews/:id/report         # Report review

// Media
POST   /api/reviews/:id/images         # Upload images
DELETE /api/reviews/:id/images/:imageId # Delete image

// Check eligibility
GET    /api/products/:productId/can-review # Check if user can review
```

### Seller/Admin Review Endpoints

```typescript
// Moderation
GET    /api/reviews/moderation         # Get pending reviews
PATCH  /api/reviews/:id/status         # Update review status
POST   /api/reviews/:id/moderate       # Moderate with note

// Seller Response
POST   /api/reviews/:id/response       # Add seller response
PUT    /api/reviews/:id/response       # Update seller response
DELETE /api/reviews/:id/response       # Delete seller response

// Media Moderation
PATCH  /api/reviews/:id/images/:imageId/status # Approve/reject image

// Reports
GET    /api/reviews/reports            # Get reported reviews
POST   /api/reports/:id/review         # Review report
```

## Frontend Components

### Customer Review Components

```
web/src/components/reviews/
├── ReviewList.tsx                # List of reviews with filters
├── ReviewCard.tsx                # Individual review card
├── ReviewForm.tsx                # Review submission form
├── ReviewRating.tsx              # Interactive star rating
├── ReviewGallery.tsx             # Review images gallery
├── ReviewFilters.tsx             # Filter reviews
└── ReviewStats.tsx               # Rating breakdown display
```

**ReviewForm Component:**

```typescript
interface ReviewFormProps {
  productId: string;
  orderId?: string;
  isVerifiedPurchase?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Features:
// - Star rating (required)
// - Review title (optional)
// - Review comment (required, min length)
// - Photo upload (up to 5 images)
// - Video upload (optional)
// - Recommend checkbox
// - Submit button
// - Draft save (auto-save)
```

**ReviewCard Component:**

```typescript
interface ReviewCardProps {
  review: IReview;
  showProduct?: boolean;
  showFull?: boolean;
  onVote?: (reviewId: string, helpful: boolean) => void;
  onReport?: (reviewId: string) => void;
}

// Displays:
// - User info (name, avatar, verified badge)
// - Rating stars
// - Title (if any)
// - Comment (with "Read more" for long reviews)
// - Images/video
// - Helpful counts
// - Vote buttons
// - Seller response (if any)
// - Date
```

**ReviewStats Component:**

```typescript
interface ReviewStatsProps {
  productId: string;
  stats: IReviewStats;
  onFilterByRating?: (rating: number) => void;
}

// Displays:
// - Average rating (large)
// - Total reviews count
// - Star distribution bar chart
// - Filter by rating buttons
// - Verified purchase stats
```

### Moderation Dashboard

```
web/src/app/(dashboard)/system/reviews/
├── page.tsx                      # Moderation queue
├── [id]/page.tsx                 # Review details
└── components/
    ├── ModerationQueue.tsx       # Pending reviews list
    ├── ReviewModeration.tsx      # Review with actions
    ├── MediaModeration.tsx       # Image/video approval
    ├── ReportsList.tsx           # Reported reviews
    └── ModerationStats.tsx       # Moderation metrics
```

**ModerationQueue Component:**

```typescript
interface ModerationQueueProps {
  status?: 'pending' | 'flagged' | 'all';
  autoApproveVerified?: boolean;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string, note: string) => void;
}

// Features:
// - Filter by status
// - Show review content
// - Show user/product info
// - Show images/videos
// - Bulk approve (for trusted users)
// - Approve/Reject buttons
// - Moderation note input
// - Auto-approve rules
```

### Seller Response Components

```
web/src/app/(dashboard)/seller/reviews/
├── page.tsx                      # Product reviews
├── [id]/respond/page.tsx         # Respond to review
└── components/
    ├── SellerReviewList.tsx      # Reviews for seller's products
    ├── ResponseForm.tsx          # Response editor
    └── ReviewAnalytics.tsx       # Review statistics
```

## Moderation System

### Auto-Approval Rules

```typescript
interface IModerationRule {
  name: string;
  condition: (review: IReview) => boolean;
  action: 'approve' | 'flag' | 'pending';
}

const defaultRules: IModerationRule[] = [
  {
    name: 'Auto-approve verified purchases',
    condition: (review) => review.isVerifiedPurchase,
    action: 'approve',
  },
  {
    name: 'Flag reviews with banned words',
    condition: (review) => containsBannedWords(review.comment),
    action: 'flag',
  },
  {
    name: 'Flag short reviews',
    condition: (review) => review.comment.length < 20,
    action: 'pending',
  },
  {
    name: 'Flag first-time reviewers',
    condition: (review) => isFirstTimeReviewer(review.userId),
    action: 'pending',
  },
];
```

### Content Moderation

```typescript
// Image moderation
interface IModerationService {
  moderateText(text: string): Promise<{
    approved: boolean;
    flaggedTerms?: string[];
    confidence: number;
  }>;
  moderateImage(imageUrl: string): Promise<{
    approved: boolean;
    categories?: string[];
    confidence: number;
  }>;
}

// Integration with services like:
// - AWS Rekognition (image moderation)
// - Google Cloud Vision API
// - OpenAI Moderation API (text)
```

## Review Aggregation

### Update Strategy

```typescript
// Event-driven updates
interface ReviewEvent {
  type:
    | 'review.created'
    | 'review.updated'
    | 'review.deleted'
    | 'review.moderated';
  reviewId: string;
  productId: string;
  rating: number;
  oldRating?: number; // For updates
  isVerified: boolean;
  timestamp: Date;
}

// Update product rating on events
async function handleReviewEvent(event: ReviewEvent) {
  const stats = await calculateReviewStats(event.productId);

  await Product.findByIdAndUpdate(event.productId, {
    rating: stats.averageRating,
    reviewCount: stats.totalReviews,
  });

  await ReviewStats.findOneAndUpdate(
    { productId: event.productId },
    { $set: stats },
    { upsert: true },
  );
}
```

### Stats Calculation

```typescript
async function calculateReviewStats(productId: string): Promise<IReviewStats> {
  const approvedReviews = await Review.find({
    productId,
    status: 'approved',
    deletedAt: null,
  });

  const total = approvedReviews.length;
  const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);

  const ratingDistribution = {
    5: approvedReviews.filter((r) => r.rating === 5).length,
    4: approvedReviews.filter((r) => r.rating === 4).length,
    3: approvedReviews.filter((r) => r.rating === 3).length,
    2: approvedReviews.filter((r) => r.rating === 2).length,
    1: approvedReviews.filter((r) => r.rating === 1).length,
  };

  const verifiedReviews = approvedReviews.filter((r) => r.isVerifiedPurchase);
  const verifiedSum = verifiedReviews.reduce((acc, r) => acc + r.rating, 0);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  return {
    productId,
    averageRating: total > 0 ? sum / total : 0,
    totalReviews: total,
    ratingDistribution,
    verifiedPurchaseStats: {
      count: verifiedReviews.length,
      averageRating:
        verifiedReviews.length > 0 ? verifiedSum / verifiedReviews.length : 0,
    },
    lastReviewAt: approvedReviews[0]?.createdAt,
    reviewsThisMonth: approvedReviews.filter((r) => r.createdAt >= thisMonth)
      .length,
    reviewsThisYear: approvedReviews.filter((r) => r.createdAt >= thisYear)
      .length,
    updatedAt: now,
  };
}
```

## Implementation Steps

### Step 1: Review Service Setup (Week 1)

1. **Create Review Microservice**
   - `/services/review-service/`
   - Database: `vortex-reviews`
   - RabbitMQ consumer for product events
   - RabbitMQ consumer for order events

2. **Implement Review Model**
   - Review schema
   - ReviewStats schema
   - Indexes

3. **Basic CRUD Endpoints**
   - Create review
   - Get reviews
   - Update review
   - Delete review

### Step 2: Review Submission (Week 1-2)

1. **Review Form Component**
   - Star rating input
   - Title and comment fields
   - Photo upload (Cloudinary)
   - Form validation
   - Draft auto-save

2. **Eligibility Check**
   - Verify user purchased product
   - Check for existing review
   - Limit one review per order item

3. **Image Upload**
   - Cloudinary integration
   - Image moderation
   - Size/format validation

### Step 3: Moderation System (Week 2)

1. **Moderation Rules Engine**
   - Define auto-approval rules
   - Content filtering
   - Flag suspicious reviews

2. **Moderation Dashboard**
   - Queue of pending reviews
   - Review details view
   - Approve/reject actions
   - Bulk operations

3. **Image Moderation**
   - Review uploaded images
   - Approve/reject images
   - Auto-moderation with AI

### Step 4: Voting & Reporting (Week 2)

1. **Helpful Voting**
   - Vote endpoints
   - Prevent duplicate votes
   - Track voted users

2. **Report System**
   - Report review form
   - Report queue
   - Admin review

### Step 5: Seller Responses (Week 3)

1. **Response System**
   - Add response endpoint
   - Update/delete response
   - Notification to reviewer

2. **Seller Dashboard**
   - View product reviews
   - Respond to reviews
   - Response analytics

### Step 6: Display & Integration (Week 3-4)

1. **Product Page Integration**
   - Review summary on product page
   - Review list with pagination
   - Filter by rating, verified, etc.
   - Sort by helpful, recent

2. **Review Components**
   - Review cards
   - Rating breakdown
   - Review gallery

3. **Aggregation**
   - Update product ratings
   - Cache review stats
   - Real-time updates

## Success Criteria

### Backend

- ✅ Reviews can be submitted
- ✅ Reviews with images work
- ✅ Moderation queue functions
- ✅ Auto-approval rules work
- ✅ Stats are calculated correctly
- ✅ Product ratings update

### Frontend

- ✅ Review form is user-friendly
- ✅ Reviews display correctly
- ✅ Filters work
- ✅ Helpful voting works
- ✅ Seller can respond

### Moderation

- ✅ Suspicious reviews flagged
- ✅ Moderators can approve/reject
- ✅ Reports are handled
- ✅ Images are moderated

### User Experience

- ✅ Submitting a review is easy
- ✅ Review display is informative
- ✅ Verified badge is visible
- ✅ Seller responses increase trust

## File Structure

### Backend

```
services/review-service/
├── src/
│   ├── models/
│   │   ├── Review.ts
│   │   └── ReviewStats.ts
│   ├── routes/
│   │   ├── review.routes.ts
│   │   ├── moderation.routes.ts
│   │   └── seller.routes.ts
│   ├── controllers/
│   │   ├── review.controller.ts
│   │   ├── moderation.controller.ts
│   │   └── seller.controller.ts
│   ├── services/
│   │   ├── review.service.ts
│   │   ├── moderation.service.ts
│   │   ├── aggregation.service.ts
│   │   └── image-moderation.service.ts
│   ├── consumers/
│   │   ├── product.consumer.ts    # Listen for product updates
│   │   └── order.consumer.ts      # Listen for order completion
│   └── jobs/
│       └── aggregation.job.ts     # Recalculate stats
└── package.json
```

### Frontend

```
web/src/
├── app/(dashboard)/
│   ├── system/reviews/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── components/
│   │       ├── ModerationQueue.tsx
│   │       ├── ReviewModeration.tsx
│   │       └── ReportsList.tsx
│   └── seller/reviews/
│       ├── page.tsx
│       ├── [id]/respond/page.tsx
│       └── components/
│           ├── SellerReviewList.tsx
│           └── ResponseForm.tsx
│
└── components/
    └── reviews/
        ├── ReviewList.tsx
        ├── ReviewCard.tsx
        ├── ReviewForm.tsx
        ├── ReviewRating.tsx
        ├── ReviewGallery.tsx
        ├── ReviewFilters.tsx
        └── ReviewStats.tsx
```

## Testing Checklist

### Review Submission

- [ ] Submit review without order (guest/regular)
- [ ] Submit verified purchase review
- [ ] Upload images with review
- [ ] Update own review
- [ ] Delete own review
- [ ] Cannot review same product twice

### Moderation

- [ ] Auto-approve verified purchase
- [ ] Flag review with banned words
- [ ] Moderator can approve/reject
- [ ] Moderation note is saved
- [ ] Bulk approve works

### Voting & Reporting

- [ ] Mark review as helpful
- [ ] Cannot vote twice
- [ ] Report inappropriate review
- [ ] View reported reviews

### Seller Response

- [ ] Seller can respond to review
- [ ] Response is visible
- [ ] Seller can update response
- [ ] Seller can delete response
- [ ] Reviewer gets notification

### Display

- [ ] Reviews show on product page
- [ ] Rating breakdown is accurate
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Verified badge appears

## Next Phase

After completing Phase 4, proceed to **Phase 5: Marketing & SEO**.
