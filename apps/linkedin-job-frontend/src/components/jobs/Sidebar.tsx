import { Briefcase, ClipboardList, Sun, Moon, CircleUser } from 'lucide-react';
import { useThemeStore } from '../../stores';

interface SidebarProps {
  activeView: 'jobs' | 'resume' | 'applications';
  onViewChange: (view: 'jobs' | 'resume' | 'applications') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <aside className="hidden md:flex w-18 bg-bg-sidebar border-r border-border-color z-30 flex-col items-center py-6 shrink-0 transition-colors duration-200">
      {/* Brand logo (Sober LinkedIn style) */}
      <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center mb-8 shrink-0">
        <span className="text-white font-extrabold text-base tracking-tighter">in</span>
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col gap-4 flex-1 w-full items-center">
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
      </div>

      {/* Footer / Profile and Theme actions */}
      <div className="mt-auto flex flex-col gap-4 items-center w-full">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all border border-border-color shadow-sm"
          aria-label="Alternar Tema"
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Profile / Resume button */}
        <button
          onClick={() => onViewChange('resume')}
          title="Meu Currículo"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${
            activeView === 'resume'
              ? 'bg-brand-blue text-white border-brand-blue hover:bg-brand-blue-hover'
              : 'text-text-secondary bg-transparent border-transparent hover:bg-bg-hover hover:text-text-primary'
          }`}
        >
          <CircleUser size={22} />
        </button>
      </div>
    </aside>
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
