export default function SentimentBar({
  positive = 0,
  neutral = 0,
  negative = 0,
  height = 'h-2',
  showLabels = false,
  className = '',
}) {
  const total = positive + neutral + negative;
  const pPct = total > 0 ? (positive / total) * 100 : 0;
  const nePct = total > 0 ? (neutral / total) * 100 : 0;
  const ngPct = total > 0 ? (negative / total) * 100 : 0;

  return (
    <div className={className}>
      <div className={`flex w-full ${height} rounded-full overflow-hidden bg-white/5`}>
        {pPct > 0 && (
          <div
            className="bg-[var(--color-emerald)] transition-all duration-700 ease-out"
            style={{ width: `${pPct}%` }}
            title={`Positive: ${positive}%`}
          />
        )}
        {nePct > 0 && (
          <div
            className="bg-[var(--color-text-muted)] transition-all duration-700 ease-out"
            style={{ width: `${nePct}%` }}
            title={`Neutral: ${neutral}%`}
          />
        )}
        {ngPct > 0 && (
          <div
            className="bg-[var(--color-red)] transition-all duration-700 ease-out"
            style={{ width: `${ngPct}%` }}
            title={`Negative: ${negative}%`}
          />
        )}
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1.5 text-[10px] font-mono text-[var(--color-text-muted)]">
          <span className="text-[var(--color-emerald)]">{positive}%</span>
          <span>{neutral}%</span>
          <span className="text-[var(--color-red)]">{negative}%</span>
        </div>
      )}
    </div>
  );
}
