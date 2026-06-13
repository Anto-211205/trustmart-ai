import { motion } from 'framer-motion';

function getColor(score) {
  if (score >= 75) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.2)', label: 'Highly Trusted', bg: 'rgba(16, 185, 129, 0.05)' };
  if (score >= 50) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.2)', label: 'Moderately Trusted', bg: 'rgba(245, 158, 11, 0.05)' };
  return { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.2)', label: 'Low Trust', bg: 'rgba(239, 68, 68, 0.05)' };
}

export default function TrustGauge({ score = 0, className = '' }) {
  const { stroke, glow, label, bg } = getColor(score);

  // Arc gauge parameters (180 degree arc)
  const cx = 120;
  const cy = 110;
  const r = 90;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalArc = Math.PI * r;
  const progress = (score / 100) * totalArc;

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg width="240" height="140" viewBox="0 0 240 140">
        {/* Background arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke={stroke}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={totalArc}
          initial={{ strokeDashoffset: totalArc }}
          animate={{ strokeDashoffset: totalArc - progress }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
        />
        {/* Score text */}
        <motion.text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          className="font-mono"
          fill={stroke}
          fontSize="36"
          fontWeight="700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {score}
        </motion.text>
        <motion.text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          / 100
        </motion.text>
      </svg>
      <motion.p
        className="text-sm font-semibold mt-1"
        style={{ color: stroke }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
