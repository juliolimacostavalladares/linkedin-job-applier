import { LayoutDashboard, FilePenLine, BarChart3, Sun, Moon, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore, usePublisherStore } from '../stores';

export function Sidebar() {
  const { theme, toggleTheme } = useThemeStore();
  const { setSelectedPost } = usePublisherStore();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="hidden md:flex w-18 bg-bg-sidebar border-r border-border-color z-30 flex-col items-center py-6 shrink-0 transition-colors duration-200">
      {/* Brand logo (Sober LinkedIn style) */}
      <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center mb-8 shrink-0">
        <span className="text-white font-extrabold text-lg tracking-tighter">in</span>
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
        <NavButton
          icon={<LayoutDashboard size={18} />}
          active={currentPath === '/dashboard' || currentPath === '/'}
          to="/dashboard"
          tooltip="Dashboard"
        />
        <NavButton
          icon={<FilePenLine size={18} />}
          active={currentPath.startsWith('/create')}
          to="/create"
          onClick={() => setSelectedPost(null)}
          tooltip="Criar Postagem"
        />
        <NavButton
          icon={<BarChart3 size={18} />}
          active={currentPath === '/analytics'}
          to="/analytics"
          tooltip="Métricas"
        />
        <NavButton
          icon={<User size={18} />}
          active={currentPath === '/profile'}
          to="/profile"
          tooltip="Meu Perfil"
        />
      </div>

      {/* Footer / Theme actions */}
      <div className="mt-auto flex flex-col gap-4 items-center w-full">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all border border-border-color bg-bg-card shadow-sm cursor-pointer"
          aria-label="Alternar Tema"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
      </div>
    </aside>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  active: boolean;
  to: string;
  tooltip?: string;
  onClick?: () => void;
}

function NavButton({ icon, active, to, tooltip, onClick }: NavButtonProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={tooltip}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border cursor-pointer ${
        active
          ? 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-hover'
          : 'text-text-secondary bg-transparent border-transparent hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      {icon}
    </Link>
  );
}
