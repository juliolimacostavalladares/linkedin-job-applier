import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobsStore, useJobDetailStore, useApplyFormStore } from '../stores';
import { Sidebar } from '../components/jobs/Sidebar';
import { SearchBar } from '../components/jobs/SearchBar';
import { JobList } from '../components/jobs/JobList';
import { JobDetailPanel } from '../components/jobs/JobDetailPanel';
import { ApplyModal } from '../components/apply/ApplyModal';
import type { Job } from '@linkedin-job-applier/shared';

export default function JobsPage() {
  const navigate = useNavigate();
  const { jobs, loading: jobsLoading, error: jobsError, fetchJobs, selectJob } = useJobsStore();
  const { selectedJob, applyForm } = useJobDetailStore();
  const { isApplyModalOpen, setIsApplyModalOpen, setCurrentStep, closeModal } = useApplyFormStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSelectJob = (job: Job) => {
    selectJob(job);
    setIsApplyModalOpen(false);
  };

  const handleOpenApplyModal = () => {
    setIsApplyModalOpen(true);
    setCurrentStep(0);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0a0d14] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0d14] to-[#0a0d14] font-sans text-slate-100 overflow-hidden p-2 md:p-4 lg:p-6 pb-0 md:pb-6">
      <div className="flex flex-col md:flex-row flex-1 bg-[#121620]/80 backdrop-blur-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative w-full max-w-[1600px] mx-auto">
        
        <Sidebar activeView="jobs" onViewChange={(v) => navigate(v === 'jobs' ? '/' : '/resume')} />

        <header className="md:hidden h-16 bg-[#121620] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">JobFinder</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-blue-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </button>
            <button onClick={() => navigate('/resume')} className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </button>
            <div className="w-8 h-8 ml-2 rounded-full bg-[#1a1f2e] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">ME</div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className={`w-full md:w-100 border-r border-white/5 flex flex-col shrink-0 z-10 transition-all ${selectedJob ? 'hidden md:flex' : 'flex'}`}>
            <SearchBar onRefresh={fetchJobs} loading={jobsLoading} />
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
              <JobList onSelectJob={handleSelectJob} />
            </div>
          </aside>

          <section className={`${selectedJob ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden relative`}>
            <JobDetailPanel onApply={handleOpenApplyModal} />
          </section>
        </div>
      </div>

      {isApplyModalOpen && applyForm && selectedJob && (
        <ApplyModal
          job={selectedJob}
          applyForm={applyForm}
          onClose={() => closeModal()}
        />
      )}
    </div>
  );
}
