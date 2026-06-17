import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, ClipboardList, Sun, Moon } from 'lucide-react';
import { useJobsStore, useApplyFormStore, useThemeStore, useResumeStore } from '../stores';
import { Sidebar } from '../components/jobs/Sidebar';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobList } from '../components/jobs/JobList';
import { JobDetailPanel } from '../components/jobs/JobDetailPanel';
import { ApplyModal } from '../components/apply/ApplyModal';
import type { Job } from '@linkedin-job-applier/shared';

export default function JobsPage() {
  const navigate = useNavigate();
  const { jobs, loadingList, fetchJobs, selectJob, selectedJob } = useJobsStore();
  const { isApplyModalOpen, setIsApplyModalOpen, fetchApplyForm, closeModal } = useApplyFormStore();
  const { theme, toggleTheme } = useThemeStore();
  const { name: userName } = useResumeStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSelectJob = (job: Job) => {
    selectJob(job);
    setIsApplyModalOpen(false);
  };

  const handleOpenApplyModal = () => {
    if (selectedJob) {
      setIsApplyModalOpen(true);
      fetchApplyForm(selectedJob.id, selectedJob.title, selectedJob.companyName || selectedJob.companyInfo, userName || undefined);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-bg-app font-sans text-text-primary overflow-hidden p-0 md:p-4 lg:p-5 transition-colors duration-200">
      <div className="flex flex-col md:flex-row flex-1 bg-bg-card md:rounded-xl overflow-hidden shadow-subtle border border-border-color relative w-full max-w-[1500px] mx-auto transition-colors duration-200">
        
        <Sidebar activeView="jobs" onViewChange={(v) => navigate(v === 'jobs' ? '/' : v === 'resume' ? '/resume' : '/applications')} />

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
              className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center bg-brand-blue text-white"
              title="Vagas"
            >
              <Briefcase size={16} />
            </button>
            <button 
              onClick={() => navigate('/applications')} 
              className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              title="Candidaturas"
            >
              <ClipboardList size={16} />
            </button>
            <button 
              onClick={() => navigate('/resume')} 
              className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center text-text-secondary hover:bg-bg-hover hover:text-text-primary"
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

        <div className="flex flex-1 overflow-hidden">
          {/* Compact Left Sidebar for Job List */}
          <aside className={`w-full md:w-[350px] border-r border-border-color flex flex-col shrink-0 z-10 transition-colors duration-200 ${selectedJob ? 'hidden md:flex' : 'flex'}`}>
            <SearchBar onRefresh={() => fetchJobs()} loading={loadingList} />
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
              <JobList onSelectJob={handleSelectJob} />
            </div>
          </aside>

          {/* Job Details Section */}
          <section className={`${selectedJob ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden relative bg-bg-app md:bg-transparent`}>
            <JobDetailPanel onApply={handleOpenApplyModal} />
          </section>
        </div>
      </div>

      {isApplyModalOpen && selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => closeModal()}
        />
      )}
    </div>
  );
}
