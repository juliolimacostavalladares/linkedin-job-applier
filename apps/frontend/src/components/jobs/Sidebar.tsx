import { Briefcase, FileText } from 'lucide-react';

interface SidebarProps {
  activeView: 'jobs' | 'resume';
  onViewChange: (view: 'jobs' | 'resume') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-24 bg-[#0a0d14]/50 border-r border-white/5 z-30 flex-col items-center py-8">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] mb-12">
        <span className="text-white font-bold text-lg">in</span>
      </div>
      
      <div className="flex flex-col gap-6 flex-1 w-full items-center">
        <NavButton
          icon={<Briefcase size={20} />}
          active={activeView === 'jobs'}
          onClick={() => onViewChange('jobs')}
        />
        <NavButton
          icon={<FileText size={20} />}
          active={activeView === 'resume'}
          onClick={() => onViewChange('resume')}
        />
      </div>

      <div className="mt-8 relative">
        <div className="w-10 h-10 rounded-full bg-[#1a1f2e] border border-white/10 shadow-sm flex items-center justify-center text-xs font-bold text-slate-300">
          ME
        </div>
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-[#121620]"></div>
      </div>
    </aside>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-colors border border-transparent ${
        active
          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
          : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      {icon}
    </button>
  );
}
