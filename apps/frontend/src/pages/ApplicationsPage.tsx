import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  ClipboardList, 
  Sun, 
  Moon, 
  Eye, 
  CheckCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  Building,
  Calendar,
  AlertCircle,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useApplicationsStore, useThemeStore, useJobsStore } from '../stores';
import { Sidebar } from '../components/jobs/Sidebar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Application, JobDetail } from '../types';
import { apiService } from '../services/apiService';

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const { applications, loading, syncing, fetchApplications, syncWithLinkedIn } = useApplicationsStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'viewed' | 'closed'>('all');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Job detail panel state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSync = async () => {
    const result = await syncWithLinkedIn();
    setSyncMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
    // Clear message after 5 seconds
    setTimeout(() => setSyncMessage(null), 5000);
  };

  // Handle clicking on an application card to show job details
  const handleSelectApp = async (app: Application) => {
    setSelectedApp(app);
    setJobDetail(null);
    setDetailError('');
    setLoadingDetail(true);
    try {
      const { data } = await apiService.getJobDetail(app.jobId);
      setJobDetail(data);
    } catch (err: unknown) {
      setDetailError('Não foi possível carregar os detalhes da vaga.');
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      (app.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      app.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalCount = applications.length;
  const viewedCount = applications.filter(a => a.status === 'viewed').length;
  const closedCount = applications.filter(a => a.status === 'closed').length;
  const pendingCount = totalCount - viewedCount - closedCount;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-bg-app font-sans text-text-primary overflow-hidden p-0 md:p-4 lg:p-5 transition-colors duration-200">
      <div className="flex flex-col md:flex-row flex-1 bg-bg-card md:rounded-xl overflow-hidden shadow-subtle border border-border-color relative w-full max-w-[1500px] mx-auto transition-colors duration-200">
        
        <Sidebar activeView="applications" onViewChange={(v) => navigate(v === 'jobs' ? '/' : v === 'resume' ? '/resume' : '/applications')} />

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
              onClick={() => navigate('/applications')} 
              className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center bg-brand-blue text-white"
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

        {/* Main Body */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Applications list section */}
          <div className="flex-1 flex flex-col overflow-hidden p-6">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <ClipboardList size={24} className="text-brand-blue" />
                  Minhas Candidaturas
                </h1>
                <p className="text-xs text-text-secondary mt-1">Acompanhe as candidaturas que foram enviadas pelo LinkedIn</p>
              </div>
              <div className="flex gap-2 self-start md:self-auto">
                <Button 
                  size="sm" 
                  onClick={handleSync} 
                  disabled={syncing || loading}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Sincronizar com LinkedIn
                </Button>
                <Button size="sm" onClick={() => fetchApplications()} disabled={loading} className="self-start md:self-auto">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Atualizar Lista'}
                </Button>
              </div>
            </div>

            {syncMessage && (
              <div className={`p-3 rounded-lg mb-4 ${
                syncMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {syncMessage.text}
              </div>
            )}

            {/* Stats Dashboard cards */}
            <div className="grid grid-cols-4 gap-3 mb-6 shrink-0">
              <div className="bg-bg-app border border-border-color rounded-xl p-3 flex flex-col justify-between shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary">Enviadas</span>
                <span className="text-lg md:text-xl font-black mt-1 text-text-primary">{totalCount}</span>
              </div>
              <div className="bg-bg-app border border-border-color rounded-xl p-3 flex flex-col justify-between shadow-xs border-l-4 border-l-blue-500">
                <span className="text-[9px] uppercase font-bold tracking-wider text-blue-500 flex items-center gap-1">
                  <Eye size={12} />
                  Visualizadas
                </span>
                <span className="text-lg md:text-xl font-black mt-1 text-text-primary">{viewedCount}</span>
              </div>
              <div className="bg-bg-app border border-border-color rounded-xl p-3 flex flex-col justify-between shadow-xs border-l-4 border-l-green-500">
                <span className="text-[9px] uppercase font-bold tracking-wider text-green-500 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Em Análise
                </span>
                <span className="text-lg md:text-xl font-black mt-1 text-text-primary">{pendingCount}</span>
              </div>
              <div className="bg-bg-app border border-border-color rounded-xl p-3 flex flex-col justify-between shadow-xs border-l-4 border-l-gray-400">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                  <X size={12} />
                  Encerradas
                </span>
                <span className="text-lg md:text-xl font-black mt-1 text-text-primary">{closedCount}</span>
              </div>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por cargo ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-bg-app border border-border-color rounded-lg focus:outline-none focus:border-brand-blue text-text-primary"
                />
              </div>
              <div className="flex gap-1.5 shrink-0 bg-bg-app border border-border-color p-1 rounded-lg">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === 'all' ? 'bg-bg-card text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('applied')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === 'applied' ? 'bg-bg-card text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Enviadas
                </button>
                <button
                  onClick={() => setStatusFilter('viewed')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === 'viewed' ? 'bg-bg-card text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Visualizadas
                </button>
                <button
                  onClick={() => setStatusFilter('closed')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === 'closed' ? 'bg-bg-card text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Encerradas
                </button>
              </div>
            </div>

            {/* Applications List */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pb-6 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="animate-spin text-brand-blue" size={24} />
                  <span className="text-xs text-text-secondary">Carregando candidaturas...</span>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border-color rounded-xl bg-bg-app p-4 text-center">
                  <ClipboardList size={28} className="text-text-secondary opacity-50 mb-2" />
                  <span className="text-sm font-semibold text-text-primary">Nenhuma candidatura encontrada</span>
                  <span className="text-xs text-text-secondary mt-1">Busque outra palavra-chave ou filtre por outro status.</span>
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div 
                    key={app.id} 
                    onClick={() => handleSelectApp(app)}
                    className={`p-4 border rounded-xl bg-bg-app flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-brand-blue hover:shadow-subtle ${selectedApp?.id === app.id ? 'border-brand-blue ring-1 ring-brand-blue/30' : 'border-border-color'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {app.companyLogo ? (
                        <img src={app.companyLogo} alt={app.companyName || ''} className="w-10 h-10 rounded-lg shrink-0 object-contain bg-white border border-border-color" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 bg-brand-blue/10 flex items-center justify-center border border-border-color">
                          <Building className="text-brand-blue" size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-text-primary truncate">{app.jobTitle || 'Vaga Sem Título'}</h3>
                        <p className="text-xs text-text-secondary font-medium truncate mt-0.5">{app.companyName || 'Empresa Desconhecida'}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-secondary">
                          <Calendar size={10} />
                          <span>Enviado em {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {app.status === 'viewed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Eye size={10} />
                          Visualizada
                        </span>
                      ) : app.status === 'closed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <X size={10} />
                          Encerrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle size={10} />
                          Enviada
                        </span>
                      )}
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent hover:border-border-color transition-colors"
                          title="Ver no LinkedIn"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Job details slide-out panel */}
          {selectedApp && (
            <aside className="w-full md:w-[450px] lg:w-[500px] border-t md:border-t-0 md:border-l border-border-color bg-bg-card md:bg-bg-app flex flex-col shrink-0 z-20 absolute md:relative inset-y-0 right-0 shadow-subtle md:shadow-none transition-transform duration-300 transform translate-x-0">
              
              {/* Detail header */}
              <div className="px-5 py-4 border-b border-border-color flex items-center justify-between shrink-0 bg-bg-card">
                <div>
                  <h2 className="font-bold text-sm text-text-primary">Detalhes da Candidatura</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Vaga #{selectedApp.jobId}</p>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)} 
                  className="p-1 rounded-md text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Detail body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* Meta Card */}
                <div className="bg-bg-card border border-border-color rounded-xl p-4 shadow-xs flex items-start gap-3">
                  {selectedApp.companyLogo ? (
                    <img src={selectedApp.companyLogo} alt={selectedApp.companyName || ''} className="w-12 h-12 rounded-xl object-contain bg-white border border-border-color shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-border-color shrink-0">
                      <Building className="text-brand-blue" size={22} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-text-primary leading-snug">{selectedApp.jobTitle}</h3>
                    <p className="text-sm font-semibold text-brand-blue mt-0.5">{selectedApp.companyName}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                      <span>Status:</span>
                      {selectedApp.status === 'viewed' ? (
                        <span className="font-bold text-blue-500 flex items-center gap-1">
                          <Eye size={12} /> Visualizada pelo recrutador
                        </span>
                      ) : selectedApp.status === 'closed' ? (
                        <span className="font-bold text-gray-500 flex items-center gap-1">
                          <X size={12} /> Vaga Encerrada no LinkedIn
                        </span>
                      ) : (
                        <span className="font-bold text-green-500 flex items-center gap-1">
                          <CheckCircle size={12} /> Enviada com sucesso
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date and actions */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-card border border-border-color rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Data de Envio</span>
                    <span className="block text-sm font-semibold text-text-primary mt-1">
                      {new Date(selectedApp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-bg-card border border-border-color rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Canal</span>
                    <span className="block text-sm font-semibold text-text-primary mt-1">LinkedIn</span>
                  </div>
                </div>

                {/* Job Description (Fetched) */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Descrição da Vaga</h4>
                  {loadingDetail ? (
                    <div className="flex items-center justify-center p-8 gap-2 bg-bg-card border border-border-color rounded-xl">
                      <Loader2 className="animate-spin text-brand-blue" size={16} />
                      <span className="text-xs text-text-secondary">Carregando descrição...</span>
                    </div>
                  ) : detailError ? (
                    <div className="p-4 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl flex items-center gap-2 text-xs">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{detailError}</span>
                    </div>
                  ) : jobDetail ? (
                    <div 
                      className="p-4 bg-bg-card border border-border-color rounded-xl text-sm leading-relaxed prose dark:prose-invert prose-xs text-text-primary max-h-[250px] overflow-y-auto scrollbar-hide"
                      dangerouslySetInnerHTML={{ __html: jobDetail.description }}
                    />
                  ) : (
                    <div className="p-4 bg-bg-card border border-border-color rounded-xl text-center text-xs text-text-secondary">
                      Nenhuma descrição carregada.
                    </div>
                  )}
                </div>

                {/* Applied Answers */}
                {selectedApp.answers && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Respostas Enviadas</h4>
                    <div className="p-4 bg-bg-card border border-border-color rounded-xl text-xs space-y-3 max-h-[220px] overflow-y-auto">
                      {(() => {
                        try {
                          const parsed = JSON.parse(selectedApp.answers || '{}');
                          const entries = Object.entries(parsed);
                          if (entries.length === 0) return <span className="text-text-secondary italic">Nenhuma pergunta customizada foi feita.</span>;
                          return entries.map(([qUrn, answer]) => {
                            let questionTitle = '';
                            if (jobDetail?.applyForm) {
                              const directMatch = jobDetail.applyForm.questions?.find((q) => q.urn === qUrn);
                              if (directMatch?.title) {
                                questionTitle = directMatch.title;
                              } else if (jobDetail.applyForm.steps) {
                                for (const step of jobDetail.applyForm.steps) {
                                  const stepMatch = step.questions?.find((q) => q.urn === qUrn);
                                  if (stepMatch?.title) {
                                    questionTitle = stepMatch.title;
                                    break;
                                  }
                                }
                              }
                            }

                            if (!questionTitle) {
                              const match = qUrn.match(/,(\d+),/);
                              if (match && match[1]) {
                                questionTitle = `Pergunta #${match[1]}`;
                              } else {
                                questionTitle = qUrn;
                              }
                            }

                            const displayQuestion = loadingDetail 
                              ? 'Carregando pergunta...' 
                              : questionTitle;

                            return (
                              <div key={qUrn} className="border-b border-border-color/30 pb-3 last:border-0 last:pb-0 space-y-1">
                                <span className="font-bold text-text-primary block leading-tight">
                                  {displayQuestion}
                                </span>
                                <div className="bg-bg-app px-2.5 py-1.5 rounded-lg border border-border-color/50 text-[11px] font-mono text-text-secondary break-words whitespace-pre-wrap">
                                  {String(answer)}
                                </div>
                              </div>
                            );
                          });
                        } catch {
                          return <span className="text-text-secondary">{selectedApp.answers}</span>;
                        }
                      })()}
                    </div>
                  </div>
                )}

              </div>

              {/* Detail footer actions */}
              {selectedApp.jobUrl && (
                <div className="px-5 py-4 border-t border-border-color bg-bg-card flex gap-2 shrink-0">
                  <a
                    href={selectedApp.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white py-2 rounded-lg font-semibold transition-colors text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Ver no LinkedIn</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

            </aside>
          )}

        </main>
      </div>
    </div>
  );
}
