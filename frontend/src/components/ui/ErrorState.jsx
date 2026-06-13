import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-16 h-16 rounded-full bg-[var(--color-red-bg)] border border-[var(--color-red-border)] flex items-center justify-center mb-5">
        <WifiOff size={28} className="text-[var(--color-red)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        Connection Error
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-red-bg)] border border-[var(--color-red-border)] text-[var(--color-red)] text-sm font-medium hover:bg-[var(--color-red)]/20 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </motion.div>
  );
}
