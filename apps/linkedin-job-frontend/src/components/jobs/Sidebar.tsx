import { Briefcase, ClipboardList, CircleUser } from 'lucide-react';
import { useThemeStore, useResumeStore } from '../../stores';
import { SidebarLayout } from '@linkedin-job-applier/shared';

interface SidebarProps {
  activeView: 'jobs' | 'profile' | 'applications';
  onViewChange: (view: 'jobs' | 'profile' | 'applications') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const resume = useResumeStore();

  return (
    <SidebarLayout theme={theme} onThemeToggle={toggleTheme} footerActions={
      <button
        onClick={() => onViewChange('profile')}
        title="Meu Perfil"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm cursor-pointer ${
          activeView === 'profile'
            ? 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-hover'
            : 'text-text-secondary bg-transparent border-transparent hover:bg-bg-hover hover:text-text-primary'
        }`}
      >
        {resume?.photoUrl ? (
          <img
            src={resume.photoUrl}
            alt={resume.name || ''}
            className="w-7 h-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <CircleUser size={22} />
        )}
      </button>
    }>
      <NavButton
        icon={<Briefcase size={18} />}
        active={activeView === 'jobs'}
        onClick={() => onViewChange('jobs')}
        tooltip="Vagas"
      />
      <NavButton
        icon={<ClipboardList size={18} />}
        active={activeView === 'applications'}
        onClick={() => onViewChange('applications')}
        tooltip="Candidaturas"
      />
    </SidebarLayout>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tooltip?: string;
}

function NavButton({ icon, active, onClick, tooltip }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${
        active
          ? 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-hover'
          : 'text-text-secondary bg-transparent border-transparent hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      {icon}
    </button>
  );
}
