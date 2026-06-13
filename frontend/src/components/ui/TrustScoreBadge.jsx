function getColor(score) {
  if (score >= 75) return { dot: 'bg-[var(--color-emerald)]', text: 'text-[var(--color-emerald)]', bg: 'bg-[var(--color-emerald-bg)]' };
  if (score >= 50) return { dot: 'bg-[var(--color-amber)]', text: 'text-[var(--color-amber)]', bg: 'bg-[var(--color-amber-bg)]' };
  return { dot: 'bg-[var(--color-red)]', text: 'text-[var(--color-red)]', bg: 'bg-[var(--color-red-bg)]' };
}

export default function TrustScoreBadge({ score = 0, className = '' }) {
  const { dot, text, bg } = getColor(score);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        rounded-full font-mono text-xs font-semibold
        ${bg} ${text} ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {score}%
    </span>
  );
}
