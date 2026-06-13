import { motion } from 'framer-motion';
import StarRating from '../ui/StarRating';

function getSentimentFromScore(score) {
  if (score >= 4) return { label: 'Positive', color: 'emerald' };
  if (score >= 3) return { label: 'Neutral', color: 'amber' };
  return { label: 'Negative', color: 'red' };
}

const colorMap = {
  emerald: {
    border: 'border-l-[var(--color-emerald)]',
    bg: 'bg-[var(--color-emerald-bg)]',
    text: 'text-[var(--color-emerald)]',
  },
  amber: {
    border: 'border-l-[var(--color-amber)]',
    bg: 'bg-[var(--color-amber-bg)]',
    text: 'text-[var(--color-amber)]',
  },
  red: {
    border: 'border-l-[var(--color-red)]',
    bg: 'bg-[var(--color-red-bg)]',
    text: 'text-[var(--color-red)]',
  },
};

export default function ReviewCard({ review, index = 0 }) {
  const sentiment = getSentimentFromScore(review.score);
  const c = colorMap[sentiment.color];

  return (
    <motion.div
      className={`
        glass rounded-[var(--radius-lg)] p-5
        border-l-[3px] ${c.border}
      `}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <StarRating rating={review.score} size={14} />
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {review.score}/5
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
            {sentiment.label}
          </span>
        </div>
      </div>

      {/* Summary */}
      {review.summary && (
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          {review.summary}
        </h4>
      )}

      {/* Review text */}
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-4">
        {review.review_text?.replace(/<[^>]*>/g, '') || 'No review text available.'}
      </p>
    </motion.div>
  );
}
