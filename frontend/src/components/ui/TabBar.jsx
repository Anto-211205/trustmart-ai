import { motion } from 'framer-motion';

export default function TabBar({ tabs, activeTab, onTabChange, className = '' }) {
  return (
    <div className={`flex gap-1 p-1 rounded-[var(--radius-lg)] bg-white/[0.03] border border-[var(--color-border-default)] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
            transition-colors duration-200 flex-1 cursor-pointer
            ${activeTab === tab.id
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }
          `}
          aria-label={tab.label}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--color-accent-indigo-bg)] border border-[var(--color-border-accent)]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
