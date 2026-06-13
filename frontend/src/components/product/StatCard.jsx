import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  children,
  color = 'indigo',
  className = '',
  delay = 0,
}) {
  const colorMap = {
    indigo: {
      iconBg: 'bg-[var(--color-accent-indigo-bg)]',
      iconColor: 'text-[var(--color-accent-indigo)]',
      border: 'border-[var(--color-border-accent)]',
    },
    emerald: {
      iconBg: 'bg-[var(--color-emerald-bg)]',
      iconColor: 'text-[var(--color-emerald)]',
      border: 'border-[var(--color-emerald-border)]',
    },
    amber: {
      iconBg: 'bg-[var(--color-amber-bg)]',
      iconColor: 'text-[var(--color-amber)]',
      border: 'border-[var(--color-amber-border)]',
    },
    red: {
      iconBg: 'bg-[var(--color-red-bg)]',
      iconColor: 'text-[var(--color-red)]',
      border: 'border-[var(--color-red-border)]',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      className={`glass rounded-[var(--radius-lg)] p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-[var(--radius-md)] ${c.iconBg} flex items-center justify-center`}>
          <Icon size={20} className={c.iconColor} />
        </div>
      </div>
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="text-2xl font-bold text-[var(--color-text-primary)]">
        {children}
      </div>
    </motion.div>
  );
}
