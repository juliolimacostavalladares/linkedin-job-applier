import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { useJobsStore } from '../../stores';
import type { Job } from '@linkedin-job-applier/shared';

interface JobListProps {
  onSelectJob: (job: Job) => void;
}

export function JobList({ onSelectJob }: JobListProps) {
  const { jobs, selectedJobId, loading, error, credentialError } = useJobsStore();

  if (loading && !error) {
    return (
      <div className="py-12 text-center text-slate-400">
        <RefreshCw className="mx-auto animate-spin mb-4" size={28} />
        <p className="text-sm font-medium">Buscando do LinkedIn...</p>
      </div>
    );
  }

  if (credentialError) {
    return (
      <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl text-sm flex flex-col gap-2 shadow-sm mb-4 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Credenciais do LinkedIn expiradas</p>
            <p className="text-xs opacity-80">Use a extensão do Chrome para re-sincronizar as credenciais.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm flex items-center gap-2 shadow-sm mb-4 border border-red-500/20">
        <AlertCircle size={16} />
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm bg-white/5 rounded-3xl m-2 border border-white/5">
        Nenhuma vaga encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          active={selectedJobId === job.id}
          onClick={() => onSelectJob(job)}
        />
      ))}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  active: boolean;
  onClick: () => void;
}

function JobCard({ job, active, onClick }: JobCardProps) {
  return (
    <Card active={active} onClick={onClick}>
      <div className="flex gap-4">
        {job.companyLogo ? (
          <div className="w-12 h-12 rounded-[14px] bg-[#0a0d14] shadow-sm border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img src={job.companyLogo} referrerPolicy="no-referrer" alt={job.companyInfo} className="w-10 h-10 object-contain" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-[14px] shadow-sm shrink-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-white/5 flex items-center justify-center text-blue-300 font-bold uppercase text-lg">
            {job.companyInfo?.[0] || 'C'}
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-2">
            <h3 className={`font-bold text-[15px] leading-tight truncate ${active ? 'text-white' : 'text-slate-200'}`}>
              {job.title}
            </h3>
          </div>
          <p className="text-sm text-slate-400 font-medium mt-1 truncate flex items-center gap-1.5">
            {job.companyInfo} {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>}
          </p>
        </div>
      </div>
    </Card>
  );
}
