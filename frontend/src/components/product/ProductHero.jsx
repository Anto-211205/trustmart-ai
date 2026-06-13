import { motion } from 'framer-motion';
import { ArrowLeft, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarRating from '../ui/StarRating';
import TrustScoreRing from '../ui/TrustScoreRing';

export default function ProductHero({ id, stats, trust }) {
  return (
    <motion.div
      className="glass rounded-[var(--radius-xl)] p-6 md:p-8 relative overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-indigo)] via-[var(--color-emerald)] to-[var(--color-amber)]" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-indigo-light)] transition-colors mb-4 no-underline"
          >
            <ArrowLeft size={14} />
            Back to Products
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Product #{id}
          </h1>

          {stats && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Hash size={14} className="text-[var(--color-text-muted)]" />
                <span className="text-sm text-[var(--color-text-muted)]">
                  ASIN Linked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.avg_rating} size={16} />
                <span className="text-sm font-mono text-[var(--color-text-secondary)]">
                  {stats.avg_rating}
                </span>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                {stats.review_count} reviews
              </span>
            </div>
          )}
        </div>

        {/* Trust Score */}
        {trust && (
          <div className="flex-shrink-0">
            <TrustScoreRing score={trust.trust_score} size={100} strokeWidth={8} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
