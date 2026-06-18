import { AlertCircle, RefreshCw, Bot } from 'lucide-react';
import { Card } from '../ui/Card';
import { useJobsStore } from '../../stores';
import type { Job } from '@linkedin-job-applier/shared';

interface JobListProps {
  onSelectJob: (job: Job) => void;
}

export function JobList({ onSelectJob }: JobListProps) {
  const { jobs, selectedJobId, loadingList, error, credentialError } = useJobsStore();

  if (loadingList && !error) {
    return (
      <div className="py-12 text-center text-text-secondary">
        <RefreshCw className="mx-auto animate-spin mb-3 text-text-secondary/60" size={24} />
        <p className="text-xs font-medium">Buscando do LinkedIn...</p>
      </div>
    );
  }


  if (credentialError) {
    return (
      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg text-xs flex flex-col gap-1.5 border border-amber-500/20 mb-3">
        <div className="flex items-start gap-1.5">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Credenciais expiradas</p>
            <p className="opacity-90">Use a extensão do Chrome para re-sincronizar as credenciais.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs flex items-center gap-1.5 border border-red-500/20 mb-3">
        <AlertCircle size={14} />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="py-8 text-center text-text-secondary text-xs bg-bg-hover rounded-lg border border-border-color m-1">
        Nenhuma vaga encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
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
    <Card active={active} onClick={onClick} className="py-2.5 px-3">
      <div className="flex gap-3">
        {job.companyLogo ? (
          <div className="w-10 h-10 rounded-md bg-white border border-border-color flex items-center justify-center overflow-hidden shrink-0 p-1">
            <img src={job.companyLogo} referrerPolicy="no-referrer" alt={job.companyInfo} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-md shrink-0 bg-bg-hover border border-border-color flex items-center justify-center text-brand-blue font-bold uppercase text-sm">
            {job.companyInfo?.[0] || 'C'}
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-1.5">
            <h3 className={`font-bold text-xs leading-tight truncate ${active ? 'text-brand-blue' : 'text-text-primary'}`}>
              {job.title}
            </h3>
          </div>
          <p className="text-[11px] text-text-secondary font-medium mt-0.5 truncate flex items-center gap-1.5">
            <span className="truncate">{job.companyInfo}</span>
            {job.applied && (
              <span className="inline-flex items-center gap-1 px-1 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">
                Candidatado
                {job.appliedThroughSystem ? (
                  <Bot size={9} className="opacity-70" />
                ) : (
                  <span className="text-[8px] font-black bg-[#0A66C2] text-white rounded-[2px] px-[2px] leading-[10px]">
                    in
                  </span>
                )}
              </span>
            )}
            {active && <span className="w-1 h-1 rounded-full bg-brand-blue inline-block shrink-0"></span>}
          </p>
        </div>
      </div>
    </Card>
  );
}
