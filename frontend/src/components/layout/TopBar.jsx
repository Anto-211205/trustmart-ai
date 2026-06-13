import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Bot, User } from 'lucide-react';

function getBreadcrumbs(pathname) {
  const crumbs = [{ label: 'Products', path: '/' }];

  if (pathname.startsWith('/product/')) {
    const id = pathname.split('/product/')[1];
    crumbs.push({ label: `Product #${id}`, path: pathname });
  }

  return crumbs;
}

export default function TopBar() {
  const location = useLocation();
  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={14} className="text-[var(--color-text-muted)]" />}
            {i === crumbs.length - 1 ? (
              <span className="text-[var(--color-text-primary)] font-medium">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors no-underline"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* AI Engine Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-emerald-bg)] border border-[var(--color-emerald-border)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-emerald)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-emerald)]" />
          </span>
          <span className="text-xs font-medium text-[var(--color-emerald)]">AI Engine Active</span>
          <Bot size={14} className="text-[var(--color-emerald)]" />
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-indigo)] to-[var(--color-accent-indigo-dark)] flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  );
}
