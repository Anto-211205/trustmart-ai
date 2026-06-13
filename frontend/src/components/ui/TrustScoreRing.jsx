import { motion } from 'framer-motion';

function getColor(score) {
  if (score >= 75) return { stroke: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
  if (score >= 50) return { stroke: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
  return { stroke: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
}

export default function TrustScoreRing({
  score = 0,
  size = 80,
  strokeWidth = 6,
  className = '',
  showLabel = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const { stroke, bg } = getColor(score);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={bg}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${stroke}40)` }}
        />
      </svg>
      {showLabel && (
        <motion.span
          className="absolute font-mono text-sm font-semibold"
          style={{ color: stroke }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {score}
        </motion.span>
      )}
    </div>
  );
}
