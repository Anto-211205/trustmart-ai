import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function RatingDistribution({ reviews = [], className = '' }) {
  // Calculate distribution from reviews
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const score = Math.min(5, Math.max(1, Math.round(r.score)));
    dist[score] = (dist[score] || 0) + 1;
  });

  const total = reviews.length || 1;
  const maxCount = Math.max(...Object.values(dist), 1);

  const bars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: dist[star],
    pct: ((dist[star] / total) * 100).toFixed(0),
    width: (dist[star] / maxCount) * 100,
  }));

  return (
    <div className={`space-y-2.5 ${className}`}>
      {bars.map((bar, i) => (
        <div key={bar.star} className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-8 justify-end">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">{bar.star}</span>
            <Star size={10} className="text-[var(--color-amber)] fill-[var(--color-amber)]" />
          </div>
          <div className="flex-1 h-2.5 rounded-full bg-white/[0.03] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: bar.star >= 4
                  ? 'var(--color-emerald)'
                  : bar.star === 3
                    ? 'var(--color-amber)'
                    : 'var(--color-red)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${bar.width}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)] w-10 text-right">
            {bar.count}
          </span>
        </div>
      ))}
    </div>
  );
}
