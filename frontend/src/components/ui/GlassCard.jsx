import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'p-6',
  ...props
}) {
  return (
    <motion.div
      className={`
        glass rounded-[var(--radius-lg)] ${padding}
        transition-all duration-300 ease-out
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { y: -2, scale: 1.005 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
