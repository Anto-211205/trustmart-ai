import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Products', icon: LayoutDashboard },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <motion.aside
      className="h-screen sticky top-0 flex flex-col bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] z-40"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--color-border-default)]">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-accent-indigo)] to-[var(--color-accent-indigo-dark)] flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-base font-bold text-[var(--color-text-primary)]">Trust</span>
              <span className="text-base font-bold text-gradient">Mart</span>
              <span className="text-[10px] font-medium text-[var(--color-accent-indigo)] ml-1.5 bg-[var(--color-accent-indigo-bg)] px-1.5 py-0.5 rounded">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
              text-sm font-medium transition-all duration-200 group relative no-underline
              ${isActive
                ? 'bg-[var(--color-accent-indigo-bg)] text-[var(--color-accent-indigo-light)] border border-[var(--color-border-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/[0.03] border border-transparent'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-[var(--color-accent-indigo)]' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* AI Branding */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-4 mx-3 mb-3 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-accent-indigo-bg)] to-transparent border border-[var(--color-border-accent)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--color-accent-indigo)]" />
              <span className="text-xs font-semibold text-[var(--color-accent-indigo-light)]">AI Powered</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
              Sentiment analysis, fake review detection & trust scoring
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/[0.03] transition-colors cursor-pointer"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </motion.aside>
  );
}
