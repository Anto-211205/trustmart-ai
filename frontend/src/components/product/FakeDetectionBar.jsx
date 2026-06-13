import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

export default function FakeDetectionBar({ fakeData, className = '' }) {
  if (!fakeData) return null;

  const data = [
    {
      name: 'Reviews',
      genuine: fakeData.genuine_reviews,
      fake: fakeData.fake_reviews,
    },
  ];

  const genuinePct = fakeData.total_reviews > 0
    ? ((fakeData.genuine_reviews / fakeData.total_reviews) * 100).toFixed(1)
    : 0;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Labels */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-emerald)]" />
          <span className="text-[var(--color-text-secondary)]">Genuine ({fakeData.genuine_reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-red)]" />
          <span className="text-[var(--color-text-secondary)]">Fake ({fakeData.fake_reviews})</span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="h-8 rounded-full overflow-hidden bg-white/[0.03] flex">
        {fakeData.genuine_reviews > 0 && (
          <motion.div
            className="h-full bg-[var(--color-emerald)] flex items-center justify-center"
            initial={{ width: 0 }}
            animate={{ width: `${genuinePct}%` }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          >
            <span className="text-[10px] font-mono font-bold text-white px-2">
              {genuinePct}%
            </span>
          </motion.div>
        )}
        {fakeData.fake_reviews > 0 && (
          <motion.div
            className="h-full bg-[var(--color-red)] flex items-center justify-center flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <span className="text-[10px] font-mono font-bold text-white px-2">
              {fakeData.fake_percentage}%
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
