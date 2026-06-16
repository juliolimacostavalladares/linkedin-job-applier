import { Building, LinkIcon, CheckCircle, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useJobsStore } from '../../stores';

interface JobDetailPanelProps {
  onApply: () => void;
}

export function JobDetailPanel({ onApply }: JobDetailPanelProps) {
  const { selectedJob, loading, error, credentialError, selectedJobId } = useJobsStore();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-app">
        <RefreshCw className="animate-spin text-text-secondary/60" size={24} />
      </div>
    );
  }

  if (!selectedJob) {
    if (credentialError && selectedJobId) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-6 text-center bg-bg-app">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
          <p className="text-base font-bold text-text-primary mb-1">Credenciais Expiradas</p>
          <p className="text-xs text-text-secondary max-w-sm">
            As credenciais do LinkedIn armazenadas no servidor expiraram. Use a extensão do Chrome para re-sincronizar.
          </p>
        </div>
      );
    }

    if (error && selectedJobId) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-6 text-center bg-bg-app">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <p className="text-base font-bold text-text-primary mb-1">Erro ao Carregar Vaga</p>
          <p className="text-xs text-text-secondary max-w-sm">{error}</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-6 text-center bg-bg-app">
        <div className="w-16 h-16 bg-bg-card border border-border-color rounded-lg flex items-center justify-center mb-4 shadow-sm">
          <Briefcase size={28} className="text-text-secondary/60" />
        </div>
        <p className="text-base font-bold text-text-primary mb-1">Selecione uma vaga</p>
        <p className="text-xs text-text-secondary">Escolha uma oportunidade na lista ao lado para ver os detalhes e candidatar-se.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-0 md:p-4 md:pb-0 h-full bg-bg-app">
      <div className="flex-1 bg-bg-card border border-border-color md:rounded-lg shadow-sm flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 mb-20 md:mb-0 scrollbar-hide">
          
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              {selectedJob.companyLogo ? (
                <div className="w-14 h-14 rounded-md border border-border-color flex items-center justify-center overflow-hidden bg-white shrink-0 p-1.5 shadow-sm">
                  <img src={selectedJob.companyLogo} referrerPolicy="no-referrer" alt={selectedJob.companyName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-md border border-border-color shrink-0 bg-bg-hover flex items-center justify-center text-brand-blue font-bold text-lg uppercase shadow-sm">
                  {selectedJob.companyName?.[0] || 'V'}
                </div>
              )}
              
              <div>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full"></span> Ativo
                </div>
                <h1 className="text-lg md:text-xl font-bold text-text-primary leading-tight">{selectedJob.title}</h1>
                <p className="text-text-secondary text-xs font-medium mt-1 flex items-center flex-wrap gap-1">
                  <Building size={12} className="inline shrink-0" />
                  <span className="font-semibold text-text-primary">{selectedJob.companyName || 'Empresa Confidencial'}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedJob.employmentStatus?.replace(/_/g, ' ').toLowerCase()}</span>
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2 md:mt-0 shrink-0">
              <Button size="md" onClick={onApply} icon={<CheckCircle size={15} />}>
                Candidatar-se
              </Button>
              <a 
                href={selectedJob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border border-border-color text-text-primary px-3 py-2 rounded-lg font-semibold hover:bg-bg-hover transition-colors text-sm inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Ver no LinkedIn</span>
                <LinkIcon size={13} />
              </a>
            </div>
          </div>

          <hr className="border-border-color my-5" />

          {/* Job Description */}
          <div className="w-full">
            <h2 className="text-sm font-bold mb-3 text-text-primary uppercase tracking-wider">Descrição da vaga</h2>
            <div 
              className="text-text-primary/90 leading-relaxed text-xs md:text-sm whitespace-pre-wrap font-sans space-y-4"
              dangerouslySetInnerHTML={{ __html: selectedJob.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
