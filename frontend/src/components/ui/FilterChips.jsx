export default function FilterChips({ filters, activeFilter, onFilterChange, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="tablist" aria-label="Filter products">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          role="tab"
          aria-selected={activeFilter === filter.id}
          className={`
            px-4 py-2 rounded-full text-sm font-medium cursor-pointer
            transition-all duration-200 border
            ${activeFilter === filter.id
              ? 'bg-[var(--color-accent-indigo-bg)] border-[var(--color-border-accent)] text-[var(--color-accent-indigo-light)] shadow-[var(--shadow-glow-indigo)]'
              : 'bg-transparent border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-secondary)]'
            }
          `}
        >
          {filter.icon && <span className="mr-1.5">{filter.icon}</span>}
          {filter.label}
          {filter.count !== undefined && (
            <span className={`ml-1.5 text-xs font-mono ${
              activeFilter === filter.id ? 'text-[var(--color-accent-indigo)]' : 'text-[var(--color-text-muted)]'
            }`}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
