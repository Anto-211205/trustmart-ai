import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ rating = 0, size = 16, className = '' }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const roundUp = rating - fullStars >= 0.75;
  const totalFull = roundUp ? fullStars + 1 : fullStars;

  for (let i = 0; i < totalFull; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        size={size}
        className="fill-[var(--color-amber)] text-[var(--color-amber)]"
      />
    );
  }

  if (hasHalf && !roundUp) {
    stars.push(
      <StarHalf
        key="half"
        size={size}
        className="fill-[var(--color-amber)] text-[var(--color-amber)]"
      />
    );
  }

  const remaining = 5 - stars.length;
  for (let i = 0; i < remaining; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        size={size}
        className="text-white/10"
      />
    );
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {stars}
    </div>
  );
}
