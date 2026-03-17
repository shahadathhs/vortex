'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId: _productId }: ReviewListProps) {
  // TODO: Fetch reviews from API
  const mockReviews = [
    {
      id: '1',
      user: { name: 'John Doe', avatar: '' },
      rating: 5,
      title: 'Excellent product!',
      comment:
        'Exactly as described. Fast shipping and great quality. Highly recommend!',
      isVerifiedPurchase: true,
      createdAt: '2024-03-10',
      helpfulVotes: 12,
    },
    {
      id: '2',
      user: { name: 'Jane Smith', avatar: '' },
      rating: 4,
      title: 'Good value for money',
      comment: 'Nice product, works as expected. Would buy again.',
      isVerifiedPurchase: true,
      createdAt: '2024-03-05',
      helpfulVotes: 8,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <Button variant="outline">Write a Review</Button>
      </div>

      <div className="space-y-6">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0"
          >
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.user.avatar} />
                <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{review.user.name}</span>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {review.title && (
                  <h4 className="font-medium mb-1">{review.title}</h4>
                )}
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {review.comment}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Helpful ({review.helpfulVotes})
                  </button>
                  <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
