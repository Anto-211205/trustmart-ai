import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import TrustScoreRing from '../ui/TrustScoreRing';
import TrustScoreBadge from '../ui/TrustScoreBadge';
import StarRating from '../ui/StarRating';
import SentimentBar from '../ui/SentimentBar';

export default function ProductCard({ product, enrichedData, index = 0 }) {
  const navigate = useNavigate();

  const stats = enrichedData?.stats;
  const trust = enrichedData?.trust;
  const fake = enrichedData?.fake;
  const isLoaded = stats && trust && fake;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <GlassCard
        onClick={() => navigate(`/product/${product.id}`)}
        className="group relative overflow-hidden h-full"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate mb-1">
              Product #{product.id}
            </h3>
            <p className="text-xs font-mono text-[var(--color-text-muted)] truncate">
              {product.amazon_product_id}
            </p>
          </div>
          {isLoaded && (
            <TrustScoreRing score={trust.trust_score} size={64} strokeWidth={5} />
          )}
          {!isLoaded && (
            <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
          )}
        </div>

        {/* Rating & Reviews */}
        {isLoaded ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={stats.avg_rating} size={14} />
              <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                {stats.avg_rating}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <MessageSquare size={11} />
                {stats.review_count}
              </span>
            </div>

            {/* Sentiment Bar */}
            <SentimentBar
              positive={trust.sentiment.positive}
              neutral={trust.sentiment.neutral}
              negative={trust.sentiment.negative}
              showLabels
              className="mb-3"
            />

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <TrustScoreBadge score={trust.trust_score} />
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold
                ${fake.fake_percentage > 30
                  ? 'bg-[var(--color-red-bg)] text-[var(--color-red)]'
                  : fake.fake_percentage > 15
                    ? 'bg-[var(--color-amber-bg)] text-[var(--color-amber)]'
                    : 'bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]'
                }
              `}>
                {fake.fake_percentage}% fake
              </span>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="skeleton h-3 w-3/4" />
            <div className="skeleton h-2 w-full rounded-full" />
            <div className="flex gap-2">
              <div className="skeleton h-5 w-14 rounded-full" />
              <div className="skeleton h-5 w-18 rounded-full" />
            </div>
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-bg-base)]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-xs font-semibold text-[var(--color-accent-indigo-light)] flex items-center gap-1.5">
            Analyze <ArrowRight size={14} />
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
