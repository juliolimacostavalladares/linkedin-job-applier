import { useEffect, useState } from 'react';
import { Briefcase, AlertCircle, RefreshCw, MapPin, Building, LinkIcon, Clock, CheckCircle, FileText } from 'lucide-react';
import type { Job, JobDetail } from './types';

export default function App() {
  const [configChecked, setConfigChecked] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState('');

  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [applyForm, setApplyForm] = useState<any>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [resumeText, setResumeText] = useState(() => localStorage.getItem("resume_text") || "");
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<any[]>([]);
  const [generatingAnswers, setGeneratingAnswers] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<'jobs' | 'resume'>('jobs');
  const [profileId, setProfileId] = useState("ACoAACl_iLsBUIs0ZwKzUBTxTMYr7FEp4K8_m_o");
  const [isFetchingPdf, setIsFetchingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [resumeFilename, setResumeFilename] = useState(() => localStorage.getItem("resume_filename") || "");


  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setHasCredentials(data.hasCredentials);
        setConfigChecked(true);
        if (data.hasCredentials || data.hasImportedJobs) {
          fetchJobs();
        }
      })
      .catch(err => {
        console.error(err);
        setConfigChecked(true);
      });
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    setError('');
    setSelectedJob(null);
    setApplyForm(null);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar as vagas');
      }
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSelectJob = async (job: Job) => {
    setLoadingDetail(true);
    setSelectedJob(null);
    setApplyForm(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar detalhes');
      setSelectedJob({ ...data, companyName: job.companyInfo, companyLogo: job.companyLogo });

      fetchApplyForm(job.id);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchApplyForm = async (id: string) => {
     setLoadingForm(true);
     setAiAnswers([]);
     try {
        const res = await fetch(`/api/jobs/${id}/apply-form`);
        const data = await res.json();
        setApplyForm(data);
     } catch (err) {
        console.error("Erro ao buscar form", err);
     } finally {
        setLoadingForm(false);
     }
  };

  const handleSaveResume = () => {
    localStorage.setItem("resume_text", resumeText);
    setIsEditingResume(false);
  };

  const handleFetchLinkedInPdf = async () => {
    if (!profileId.trim()) {
      setPdfError("Profile ID é obrigatório");
      return;
    }
    setIsFetchingPdf(true);
    setPdfError('');
    try {
      const res = await fetch("/api/resume/from-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profileId.trim() })
      });
      const data = await res.json();
      if (res.ok && data.text) {
         setResumeText(data.text);
         localStorage.setItem("resume_text", data.text);
         setResumeFilename("Curriculo_LinkedIn.pdf");
         localStorage.setItem("resume_filename", "Curriculo_LinkedIn.pdf");
         alert("Currículo importado com sucesso do LinkedIn!");
      } else {
         setPdfError(data.error || "Erro ao extrair PDF");
      }
    } catch (err: any) {
      setPdfError(err.message || "Falha na requisição");
    } finally {
      setIsFetchingPdf(false);
    }
  };

  const generateAnswers = async () => {
    if (!applyForm?.questions || applyForm.questions.length === 0) return;
    setGeneratingAnswers(true);
    try {
      const res = await fetch("/api/generate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: applyForm.questions,
          resume: resumeText
        })
      });
      const data = await res.json();
      if (res.ok && data.answers) {
        setAiAnswers(data.answers);
        setFormValues(prev => {
          const next = { ...prev };
          data.answers.forEach((ans: any) => {
            if (ans.answer) {
              next[ans.urn] = ans.answer;
            }
          });
          
          // Auto-preencher campos de tipo 'file' com o arquivo PDF do LinkedIn
          const currentStepQuestions = applyForm.steps[currentStep]?.questions || [];
          currentStepQuestions.forEach((q: any) => {
             if (q.type === 'file' && (resumeFilename || resumeText)) {
                // If there's an associated filename or at least resume text imported
                next[q.urn] = resumeFilename || "Curriculo_LinkedIn.pdf";
             }
          });
          
          return next;
        });
      } else {
        alert(data.error || "Erro ao gerar respostas");
      }
    } catch (err: any) {
      alert("Erro ao conectar com a IA.");
    } finally {
      setGeneratingAnswers(false);
    }
  };

  if (!configChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-slate-50">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!hasCredentials && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Abordagem Segura (Anti-Bloqueio)</h1>
          <p className="text-slate-500">
            Você não precisa expor seus Cookies / CSRF para o servidor. Utilize nossa extensão para extrair o JSON localmente e enviá-lo ao sistema.
          </p>
          <div className="bg-slate-50 text-left p-4 rounded-lg text-sm font-sans text-slate-700 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-blue-500" />
              Como configurar a Extensão do Chrome:
            </h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Na raiz do projeto neste editor, procure a pasta <strong>/extension</strong>.</li>
              <li>Acesse <code className="bg-white border border-slate-200 px-1 rounded text-xs select-all">chrome://extensions/</code> no seu navegador.</li>
              <li>Ative o <strong>Modo do desenvolvedor</strong> no canto superior direito.</li>
              <li>Clique em <strong>Carregar sem compactação</strong> e selecione a pasta <code>extension</code>.</li>
              <li>Fixe a extensão na barra e clique em <strong>Buscar Vagas Invisível</strong>.</li>
              <li>As vagas sincronizadas ignoram verificações e aparecem direto nesta interface. Alternativamente, você ainda pode definir as chaves de ambiente <code>LINKEDIN_COOKIE</code> e <code>LINKEDIN_CSRF</code> (em Secrets) se desejar a busca Server-side de alto risco.</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Aguardando dados da extensão...</span>
              <button onClick={() => window.location.reload()} className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded font-medium transition-colors">
                Verificar Recebimento
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0a0d14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0d14] to-[#0a0d14] font-sans text-slate-100 overflow-hidden p-2 md:p-4 lg:p-6 pb-0 md:pb-6">
      {/* App Window */}
      <div className="flex flex-col md:flex-row flex-1 bg-[#121620]/80 backdrop-blur-2xl md:rounded-[24px] overflow-hidden shadow-2xl border border-white/10 relative w-full max-w-[1600px] mx-auto">
        
        {/* Left Rail Sidebar */}
        <aside className="hidden md:flex w-24 bg-[#0a0d14]/50 border-r border-white/5 z-30 flex-col items-center py-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] mb-12">
            <span className="text-white font-bold text-lg">in</span>
          </div>
          
          <div className="flex flex-col gap-6 flex-1 w-full items-center">
            <button 
                onClick={() => setActiveView('jobs')}
                className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-colors border border-transparent ${activeView === 'jobs' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Briefcase size={20} />
            </button>
            <button className="w-12 h-12 rounded-[16px] text-slate-500 hover:bg-white/5 hover:text-slate-200 flex items-center justify-center transition-colors border border-transparent">
              <Clock size={20} />
            </button>
            <button className="w-12 h-12 rounded-[16px] text-slate-500 hover:bg-white/5 hover:text-slate-200 flex items-center justify-center transition-colors border border-transparent">
              <MapPin size={20} />
            </button>
            <button 
                onClick={() => setActiveView('resume')}
                className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-colors border border-transparent ${activeView === 'resume' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <FileText size={20} />
            </button>
          </div>

          <div className="mt-8 relative">
             <div className="w-10 h-10 rounded-full bg-[#1a1f2e] border border-white/10 shadow-sm flex items-center justify-center text-xs font-bold text-slate-300">ME</div>
             <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-[#121620]"></div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-[#121620] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">JobFinder</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveView('jobs')} className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${activeView === 'jobs' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Briefcase size={16}/></button>
            <button onClick={() => setActiveView('resume')} className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${activeView === 'resume' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><FileText size={16}/></button>
            <div className="w-8 h-8 ml-2 rounded-full bg-[#1a1f2e] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">ME</div>
          </div>
        </header>

        {/* Main Layout Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {activeView === 'resume' ? (
            <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto bg-[#0a0d14] relative scrollbar-hide">
              <div className="max-w-4xl mx-auto w-full relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center shrink-0">
                       <FileText size={24} className="text-purple-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white tracking-tight">Meu Currículo</h1>
                      <p className="text-slate-400 text-sm mt-1">Este currículo será usado pela IA para preencher candidaturas automaticamente.</p>
                    </div>
                 </div>

                 <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 shadow-xl w-full mb-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                       <div>
                           <h2 className="text-lg font-bold text-slate-200">Importar do LinkedIn</h2>
                           <p className="text-slate-400 text-sm mt-1">Extraia automaticamente o texto do PDF do seu perfil.</p>
                       </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                       <input 
                          type="text" 
                          value={profileId}
                          onChange={e => setProfileId(e.target.value)}
                          placeholder="ID do Perfil (Ex: ACoAA...)" 
                          className="flex-1 border border-white/10 bg-[#0a0d14] text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                       />
                       <button 
                          onClick={handleFetchLinkedInPdf} 
                          disabled={isFetchingPdf}
                          className="bg-transparent border border-blue-500/50 text-blue-400 px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-500/10 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                         {isFetchingPdf ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                         {isFetchingPdf ? 'Baixando e Extraindo...' : 'Extrair PDF'}
                       </button>
                    </div>
                    {pdfError && <p className="text-red-400 text-sm mt-3">{pdfError}</p>}
                 </div>

                 <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 shadow-xl w-full">
                    <div className="flex justify-between items-center mb-4">
                       <h2 className="text-lg font-bold text-slate-200">Texto do Currículo</h2>
                       <button onClick={handleSaveResume} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-blue-500 transition-colors">
                         Salvar Currículo
                       </button>
                    </div>
                    <textarea 
                       value={resumeText}
                       onChange={e => setResumeText(e.target.value)}
                       className="w-full h-[50vh] min-h-[300px] border border-white/10 bg-[#0a0d14] text-slate-300 rounded-xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 leading-relaxed font-mono"
                       placeholder="Cole todo o texto do seu currículo aqui... Experiências, formação, habilidades."
                    />
                 </div>
              </div>
            </div>
          ) : (
            <>
              {/* Jobs List Panel */}
              <aside className={`w-full md:w-[400px] border-r border-white/5 flex flex-col shrink-0 z-10 transition-all ${selectedJob ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 pb-2 shrink-0">

               <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-white">Vagas</h1>
                  <button 
                    onClick={fetchJobs} 
                    disabled={loadingJobs}
                    className="w-10 h-10 bg-[#1a1f2e] border border-white/5 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-blue-400 font-semibold transition-colors"
                  >
                    <RefreshCw size={16} className={loadingJobs ? 'animate-spin' : ''} />
                  </button>
               </div>
               
               {/* Search bar pill */}
               <div className="relative mb-4">
                  <input type="text" placeholder="Search jobs, skills..." className="w-full bg-[#0a0d14] border border-white/10 rounded-full py-3.5 pl-12 pr-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-500" />
                  <svg className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center gap-2 shadow-sm mb-4">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              {loadingJobs && !error && (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="mx-auto animate-spin mb-4" size={28} />
                  <p className="text-sm font-medium">Buscando do LinkedIn...</p>
                </div>
              )}

              {!loadingJobs && !error && jobs.length === 0 && (
                 <div className="py-12 text-center text-slate-500 text-sm bg-white/50 rounded-3xl m-2">
                   Nenhuma vaga encontrada.
                 </div>
              )}

              <div className="space-y-4 pt-2">
                {jobs.map(job => {
                  const isActive = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      className={`block w-full text-left transition-all cursor-pointer flex gap-4 p-5 rounded-[24px] ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-900/40 to-[#121620] shadow-[0_8px_30px_rgb(0,0,0,0.2)] scale-[1.02] border border-blue-500/30' 
                          : 'bg-[#1a1f2e]/50 hover:bg-[#1a1f2e] shadow-sm border border-transparent hover:border-white/10'
                      }`}
                    >
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
                          <h3 className={`font-bold text-[15px] leading-tight truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-400 font-medium mt-1 truncate flex items-center gap-1.5">
                           {job.companyInfo} {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content: Job Detail */}
          <section className={`${selectedJob ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden relative`}>
            {loadingDetail ? (
               <div className="flex-1 flex items-center justify-center">
                 <RefreshCw className="animate-spin text-slate-400" size={32} />
               </div>
            ) : selectedJob ? (
              <div className="flex-1 flex flex-col overflow-hidden p-0 md:p-6 md:pb-0 h-full">
                
                {/* Mobile Back Button */}
                <div className="md:hidden p-4 bg-[#121620] pb-0">
                  <button onClick={() => setSelectedJob(null)} className="text-slate-300 font-semibold px-4 py-2 bg-[#1a1f2e] border border-white/10 rounded-full shadow-sm text-sm">
                    ← Voltar
                  </button>
                </div>

                {/* Main White Card Context */}
                <div className="flex-1 bg-[#0f131c] border-l border-t border-white/5 md:rounded-tl-[24px] shadow-2xl flex flex-col overflow-hidden relative">
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
                             <Building size={16} /> {selectedJob.companyName || "Empresa Confidencial"}
                             <span className="text-slate-600">•</span>
                             <span className="capitalize">{selectedJob.employmentStatus?.replace(/_/g, ' ').toLowerCase()}</span>
                           </p>
                         </div>
                       </div>
                       
                       <div className="flex flex-col gap-3 shrink-0">
                         {applyForm && (
                            <button
                              onClick={() => { setIsApplyModalOpen(true); setCurrentStep(0); }}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:from-blue-500 hover:to-purple-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 border-0"
                            >
                              Apply Now <CheckCircle size={18} />
                            </button>
                         )}
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
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-transparent">
                <div className="w-24 h-24 bg-[#1a1f2e] border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-sm">
                   <Briefcase size={36} className="text-slate-400" />
                </div>
                <p className="text-xl font-bold text-white mb-2">Desperte sua próxima oportunidade</p>
                <p className="text-sm text-slate-400 font-medium">Selecione uma vaga no painel lateral para explorá-la em detalhes.</p>
              </div>
            )}
          </section>
            </>
          )}

        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && applyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-[#121620] border border-white/10 max-w-2xl w-full rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0d14]">
               <div>
                  <h3 className="font-bold text-lg text-white">Candidatura Simplificada</h3>
                  <p className="text-sm text-slate-400">{selectedJob?.title} • {selectedJob?.companyName}</p>
               </div>
               <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white p-2 transition-colors">
                 ✕
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
              {!applyForm.success ? (
                  <div className="text-amber-400 bg-amber-500/10 p-4 rounded-lg flex items-start gap-2 border border-amber-500/20 text-sm">
                     <AlertCircle size={18} className="shrink-0 mt-0.5" />
                     <p className="font-medium">{applyForm.message}</p>
                  </div>
              ) : applyForm.steps?.length > 0 ? (
                 <div className="space-y-6">
                    {/* Stepper Header */}
                    <div className="flex items-center gap-2 mb-6">
                       {applyForm.steps.map((_: any, idx: number) => (
                          <div key={idx} className="flex-1 flex flex-col gap-2">
                             <div className={`h-1.5 w-full rounded-full ${idx <= currentStep ? 'bg-blue-500' : 'bg-white/10'}`} />
                             <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${idx === currentStep ? 'text-blue-400' : 'text-slate-500'}`}>
                               {applyForm.steps[idx].title}
                             </span>
                          </div>
                       ))}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-bold text-lg text-white">{applyForm.steps[currentStep].title}</h3>
                       <button 
                         onClick={generateAnswers}
                         disabled={generatingAnswers || aiAnswers.length > 0}
                         className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded font-bold text-xs hover:bg-purple-500/30 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                       >
                         {generatingAnswers && <RefreshCw size={12} className="animate-spin" />}
                         ✨ Auto-preencher Etapa
                       </button>
                    </div>

                    {isEditingResume && (
                        <div className="bg-[#0a0d14] p-4 border border-white/10 rounded-lg mb-4">
                           <h3 className="font-bold text-sm text-slate-200 mb-2">Seu Currículo (Base para IA)</h3>
                           <textarea 
                               value={resumeText}
                               onChange={e => setResumeText(e.target.value)}
                               className="w-full h-24 border border-white/10 bg-[#1a1f2e] text-white rounded p-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
                               placeholder="Cole seu currículo em texto aqui..."
                           />
                           <div className="flex gap-2 justify-end">
                              <button onClick={() => setIsEditingResume(false)} className="text-xs px-3 py-1.5 text-slate-400 font-medium hover:text-white">Ocultar</button>
                              <button onClick={handleSaveResume} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700">Salvar Currículo</button>
                           </div>
                        </div>
                    )}
                    
                    {!isEditingResume && resumeText.trim() === "" && (
                       <button onClick={() => setIsEditingResume(true)} className="text-xs bg-amber-500/10 text-amber-400 px-3 py-2 rounded-md font-medium border border-amber-500/20 w-full mb-4 hover:bg-amber-500/20 transition-colors text-left flex items-center gap-2">
                           <AlertCircle size={14} /> Nenhum currículo cadastrado. Clique para adicionar e usar a IA.
                       </button>
                    )}

                    <div className="space-y-5">
                       {applyForm.steps[currentStep].questions.map((q: any, i: number) => {
                          const aiAnswer = aiAnswers.find((ans: any) => ans.urn === q.urn)?.answer;
                          return (
                          <div key={i} className="flex flex-col gap-1.5 relative">
                             <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                                {q.title}
                                {q.required && <span className="text-xs font-normal text-red-400">*Obrigatório</span>}
                             </label>

                             {q.type === 'dropdown' || q.type === 'checkbox' ? (
                                <select 
                                   value={formValues[q.urn] || ""}
                                   onChange={e => setFormValues({ ...formValues, [q.urn]: e.target.value })}
                                   className="border border-white/10 rounded-md p-2.5 text-sm bg-[#0a0d14] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                                >
                                   <option value="">Selecione uma opção...</option>
                                   {q.options?.map((opt: string, j: number) => (
                                      <option key={j} value={opt}>{opt}</option>
                                   ))}
                                </select>
                             ) : q.type === 'file' ? (
                                <label className="border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/5 transition-colors rounded-md p-4 bg-[#0a0d14] flex items-center justify-center flex-col gap-2 cursor-pointer relative">
                                   <input 
                                      type="file" 
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={e => {
                                         const file = e.target.files?.[0];
                                         if (file) {
                                            setFormValues({ ...formValues, [q.urn]: file.name });
                                         }
                                      }}
                                   />
                                   {formValues[q.urn] ? (
                                     <div className="flex flex-col items-center gap-2 text-blue-400">
                                        <CheckCircle size={24} />
                                        <span className="text-sm font-medium">{formValues[q.urn]}</span>
                                     </div>
                                   ) : (
                                     <>
                                        <FileText size={24} className="text-slate-500" />
                                        <span className="text-sm text-slate-400 font-medium">Carregar documento ({q.options?.join(', ') || 'PDF, DOCX'})</span>
                                     </>
                                   )}
                                </label>
                             ) : (
                                <input 
                                   type="text" 
                                   value={formValues[q.urn] || ""}
                                   onChange={e => setFormValues({ ...formValues, [q.urn]: e.target.value })}
                                   className="border border-white/10 rounded-md p-2.5 text-sm bg-[#0a0d14] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" 
                                   placeholder="Sua resposta..." 
                                />
                             )}

                             {aiAnswer && (
                                <span className="absolute right-3 top-9 text-purple-400" title="Preenchido por IA">✨</span>
                             )}
                          </div>
                       )})}
                    </div>
                 </div>
              ) : (
                 <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                    <p>Esta vaga não possui formulário estruturado para candidatura simplificada ou já foi aplicada.</p>
                 </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-[#0a0d14] flex justify-end gap-3">
               <button 
                 onClick={() => setIsApplyModalOpen(false)} 
                 className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
               >
                 Cancelar
               </button>
               
               {applyForm?.success && applyForm.steps?.length > 0 && (
                  <>
                     {currentStep > 0 && (
                        <button 
                           onClick={() => setCurrentStep(prev => prev - 1)}
                           className="px-5 py-2.5 text-sm font-semibold border border-white/20 bg-transparent text-slate-300 hover:bg-white/5 rounded-lg transition-colors shadow-sm"
                        >
                           Voltar
                        </button>
                     )}
                     
                     {currentStep < applyForm.steps.length - 1 ? (
                        <button 
                           onClick={() => setCurrentStep(prev => prev + 1)}
                           className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                        >
                           Avançar Etapa
                        </button>
                     ) : (
                        <button 
                           onClick={() => {
                              alert('A função de POST real para o LinkedIn pode ser adicionada pelo endpoint /api/jobs/:id/submit futuramente!\n\nDados preenchidos:\n' + JSON.stringify(formValues, null, 2));
                              setIsApplyModalOpen(false);
                           }}
                           className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-sm border-0"
                        >
                           Finalizar Candidatura
                        </button>
                     )}
                  </>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
