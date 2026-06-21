import { LayoutDashboard, FilePenLine, BarChart3, CircleUser } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore, usePublisherStore } from '../stores';
import { SidebarLayout } from '@linkedin-job-applier/shared';

export function Sidebar() {
  const { theme, toggleTheme } = useThemeStore();
  const { setSelectedPost, profile } = usePublisherStore();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarLayout theme={theme} onThemeToggle={toggleTheme} footerActions={
      <Link
        to="/profile"
        title="Meu Perfil"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm cursor-pointer ${
          currentPath === '/profile'
            ? 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-hover'
            : 'text-text-secondary bg-transparent border-transparent hover:bg-bg-hover hover:text-text-primary'
        }`}
      >
        {profile?.photoUrl ? (
          <img
            src={profile.photoUrl}
            alt={profile.name || ''}
            className="w-7 h-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <CircleUser size={20} />
        )}
      </Link>
    }>
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
    </SidebarLayout>
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
