import type { ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';

interface SidebarLayoutProps {
  /** Navigation items (buttons/links) */
  children: ReactNode;
  /** Profile/footer actions */
  footerActions?: ReactNode;
  /** Theme: 'light' | 'dark' */
  theme: 'light' | 'dark';
  /** Theme toggle handler */
  onThemeToggle: () => void;
}

export function SidebarLayout({
  children,
  footerActions,
  theme,
  onThemeToggle,
}: SidebarLayoutProps) {
  return (
    <aside className="hidden md:flex w-20 bg-bg-sidebar border-r border-border-color z-30 flex-col items-center py-6 shrink-0 transition-colors duration-200">
      {/* Brand logo (LinkedIn style) */}
      <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center mb-8 shrink-0">
        <span className="text-white font-extrabold text-base tracking-tighter">in</span>
      </div>

      {/* Navigation items */}
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        {children}
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex flex-col gap-4 items-center w-full">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all border border-border-color shadow-sm cursor-pointer"
          aria-label="Alternar Tema"
          title="Alternar Tema"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {footerActions}
      </div>
    </aside>
  );
}
