import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Sun, Moon } from 'lucide-react';
import { useResumeStore, useThemeStore } from '../stores';
import { Sidebar } from '../components/jobs/Sidebar';
import { ResumeView } from '../components/resume/ResumeView';

export default function ResumePage() {
  const navigate = useNavigate();
  const resumeStore = useResumeStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-bg-app font-sans text-text-primary overflow-hidden p-0 md:p-4 lg:p-5 transition-colors duration-200">
      <div className="flex flex-col md:flex-row flex-1 bg-bg-card md:rounded-xl overflow-hidden shadow-subtle border border-border-color relative w-full max-w-[1500px] mx-auto transition-colors duration-200">
        
        <Sidebar activeView="resume" onViewChange={(v) => navigate(v === 'jobs' ? '/' : '/resume')} />

        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-bg-card border-b border-border-color flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-blue rounded-md flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tighter">in</span>
            </div>
            <span className="font-bold text-base tracking-tight text-text-primary">JobFinder</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => navigate('/')} 
              className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              title="Vagas"
            >
              <Briefcase size={16} />
            </button>
            <button 
              onClick={() => navigate('/resume')} 
              className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center bg-brand-blue text-white"
              title="Currículo"
            >
              <FileText size={16} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="w-8 h-8 ml-1 rounded-md flex items-center justify-center text-text-secondary border border-border-color bg-bg-hover"
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        <ResumeView resume={resumeStore} />
      </div>
    </div>
  );
}
