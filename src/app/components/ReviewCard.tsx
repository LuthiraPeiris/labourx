import { Quote } from 'lucide-react';
import { Review } from '../types';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewDate = review.date
    ? new Date(review.date).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Date not available';

  const reviewerName = review.userName || 'Client';
  const reviewerAvatar =
    review.userAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      reviewerName
    )}&background=8B1A2F&color=fff`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <img
            src={reviewerAvatar}
            alt={reviewerName}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  reviewerName
                )}&background=8B1A2F&color=fff`;
            }}
          />

          <div className="min-w-0 flex-1">
            <p
              className="text-card-foreground text-lg leading-tight"
              style={{ fontWeight: 600 }}
            >
              {reviewerName}
            </p>

            <p className="text-muted-foreground text-sm mt-1">
              {review.projectType || 'Completed Project'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StarRating rating={Number(review.rating || 0)} size="sm" />
          <span className="text-xs text-muted-foreground">{reviewDate}</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2">
        <Quote className="w-5 h-5 text-maroon/20 fill-maroon/20 flex-shrink-0 mt-0.5" />
        <p className="text-card-foreground text-sm leading-7">
          {review.comment}
        </p>
      </div>
    </div>
  );
}