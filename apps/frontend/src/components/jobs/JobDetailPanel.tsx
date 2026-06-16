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
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!selectedJob) {
    if (credentialError && selectedJobId) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
          <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={36} className="text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white mb-2">Credenciais Expiradas</p>
          <p className="text-sm text-slate-400 font-medium max-w-md">
            As credenciais do LinkedIn armazenadas no servidor expiraram. Use a extensão do Chrome para re-sincronizar.
          </p>
        </div>
      );
    }

    if (error && selectedJobId) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={36} className="text-red-400" />
          </div>
          <p className="text-xl font-bold text-white mb-2">Erro ao Carregar Vaga</p>
          <p className="text-sm text-slate-400 font-medium max-w-md">{error}</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-transparent">
        <div className="w-24 h-24 bg-[#1a1f2e] border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Briefcase size={36} className="text-slate-400" />
        </div>
        <p className="text-xl font-bold text-white mb-2">Desperte sua próxima oportunidade</p>
        <p className="text-sm text-slate-400 font-medium">Selecione uma vaga no painel lateral para explorá-la em detalhes.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-0 md:p-6 md:pb-0 h-full">
      <div className="flex-1 bg-[#0f131c] border-l border-t border-white/5 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto w-full p-6 md:p-10 mb-20 md:mb-0 scrollbar-hide">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="flex items-center gap-6 flex-1">
              {selectedJob.companyLogo ? (
                <div className="w-20 h-20 rounded-[20px] shadow-sm border border-white/10 flex items-center justify-center overflow-hidden bg-[#0a0d14] shrink-0">
                  <img src={selectedJob.companyLogo} referrerPolicy="no-referrer" alt={selectedJob.companyName} className="w-16 h-16 object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-[20px] shadow-sm border border-white/5 shrink-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center text-blue-300 font-bold text-3xl uppercase">
                  {selectedJob.companyName?.[0] || 'V'}
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Ativo
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedJob.title}</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium mt-1 inline-flex items-center gap-2">
                  <Building size={16} /> {selectedJob.companyName || 'Empresa Confidencial'}
                  <span className="text-slate-600">•</span>
                  <span className="capitalize">{selectedJob.employmentStatus?.replace(/_/g, ' ').toLowerCase()}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0">
              <Button size="lg" onClick={onApply} icon={<CheckCircle size={18} />}>
                Apply Now
              </Button>
              <a 
                href={selectedJob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border border-white/20 text-slate-300 px-8 py-3.5 rounded-full font-bold hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
              >
                Ver no LinkedIn <LinkIcon size={16} />
              </a>
            </div>
          </div>

          <hr className="border-white/5 my-8" />

          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-5 text-white">Descrição</h2>
            <div 
              className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{ __html: selectedJob.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
