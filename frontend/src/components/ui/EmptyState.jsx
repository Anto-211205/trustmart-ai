import { motion } from 'framer-motion';
import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageSearch,
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-[var(--color-border-default)] flex items-center justify-center mb-5">
        <Icon size={28} className="text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-accent-indigo)] text-white text-sm font-medium hover:bg-[var(--color-accent-indigo-dark)] transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
