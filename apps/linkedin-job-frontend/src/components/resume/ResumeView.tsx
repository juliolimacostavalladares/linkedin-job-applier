import { useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Briefcase, 
  GraduationCap, 
  Building, 
  User, 
  AlertCircle, 
  Edit3, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import type { ResumeState } from '../../stores';

interface ResumeViewProps {
  resume: ResumeState;
}

export function ResumeView({ resume }: ResumeViewProps) {
  const {
    resumeText, setResumeText,
    name, headline, photoUrl, about, experiences, education,
    isFetchingProfile, profileError,
    isEditingResume, setIsEditingResume,
    saveResume, fetchProfile,
  } = resume;

  useEffect(() => {
    // Auto fetch profile details on mount if they aren't loaded yet
    if (!name) {
      fetchProfile();
    }
  }, [name, fetchProfile]);

  // Loading state (first fetch)
  if (isFetchingProfile && !name) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-app text-text-secondary p-6">
        <RefreshCw className="animate-spin mb-4 text-brand-blue" size={32} />
        <p className="text-sm font-semibold text-text-primary">Sincronizando Perfil do LinkedIn...</p>
        <p className="text-xs text-text-secondary/70 mt-1 max-w-sm text-center">
          Estamos baixando seu perfil e extraindo suas experiências em segundo plano através do nosso assistente de IA.
        </p>
      </div>
    );
  }

  // Error state (when no data exists yet)
  if (profileError && !name) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-app p-6 text-center text-text-secondary">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1">Erro ao carregar perfil</h3>
        <p className="text-xs text-text-secondary max-w-md mb-4">{profileError}</p>
        <Button onClick={() => fetchProfile(true)} icon={<RefreshCw size={14} />}>
          Tentar Sincronizar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-bg-app relative scrollbar-hide transition-colors duration-200">
      <div className="max-w-3xl mx-auto w-full space-y-4 pb-12">
        
        {/* Error notification if a background sync fails */}
        {profileError && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs flex items-center justify-between border border-red-500/20 shadow-sm transition-all duration-150">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} /> {profileError}
            </span>
            <button onClick={() => fetchProfile(true)} className="text-[10px] bg-red-500/20 hover:bg-red-500/30 px-2 py-0.5 rounded font-bold uppercase">
              Re-sync
            </button>
          </div>
        )}

        {/* Tip for client-side sync */}
        <div className="p-3 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-lg text-xs flex items-start gap-2 border border-blue-500/20 shadow-sm">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Dica de Segurança:</span> Para sincronizar seu perfil do LinkedIn de forma 100% segura e evitar que a sua sessão seja invalidada pela plataforma, abra a extensão **JobFinder Sync** no seu navegador e clique no botão **Sincronizar**.
          </div>
        </div>

        {/* 1. PROFILE HEADER CARD (LinkedIn Style) */}
        <div className="bg-bg-card border border-border-color rounded-lg overflow-hidden relative shadow-subtle transition-colors">
          {/* Banner cover */}
          <div className="h-28 md:h-36 bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-800 relative">
            {isFetchingProfile && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                <RefreshCw className="animate-spin text-white" size={20} />
              </div>
            )}
          </div>
          
          {/* Profile Avatar */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-bg-card absolute left-6 top-18 md:top-22 bg-bg-hover flex items-center justify-center overflow-hidden shadow-sm">
            {photoUrl ? (
              <img src={photoUrl} alt={name || 'Usuário'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={36} className="text-text-secondary/50" />
            )}
          </div>
          
          {/* Header Card Body */}
          <div className="pt-14 md:pt-16 px-6 pb-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-extrabold text-text-primary truncate">
                  {name || 'Nome do Usuário'}
                </h2>
                <p className="text-xs md:text-sm text-text-primary/90 mt-1 leading-relaxed max-w-xl font-medium">
                  {headline || 'Nenhuma descrição do perfil.'}
                </p>
                {resume.profileId && (
                  <p className="text-[10px] text-text-secondary/70 font-mono mt-1">
                    ID: {resume.profileId}
                  </p>
                )}
              </div>
              
              <div className="flex shrink-0">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => fetchProfile(true)}
                  disabled={isFetchingProfile}
                  icon={<RefreshCw size={13} className={isFetchingProfile ? 'animate-spin' : ''} />}
                >
                  {isFetchingProfile ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ABOUT (SOBRE) SECTION */}
        <div className="bg-bg-card border border-border-color rounded-lg p-5 shadow-subtle transition-colors">
          <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">Sobre</h3>
          <p className="text-xs md:text-sm text-text-primary/80 leading-relaxed whitespace-pre-line">
            {about || 'Nenhuma informação sobre cadastrada.'}
          </p>
        </div>

        {/* 3. EXPERIENCE (EXPERIÊNCIAS) SECTION */}
        <div className="bg-bg-card border border-border-color rounded-lg p-5 shadow-subtle transition-colors">
          <h3 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider">Experiência</h3>
          {experiences && experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-bg-hover border border-border-color rounded-md flex items-center justify-center shrink-0 text-brand-blue shadow-sm">
                    <Building size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-text-primary">{exp.role}</h4>
                    <p className="text-[11px] font-semibold text-text-primary/80 mt-0.5">{exp.company}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{exp.duration}</p>
                    {exp.description && (
                      <p className="text-[11px] text-text-secondary leading-relaxed mt-2 whitespace-pre-line border-l-2 border-border-color pl-2.5">
                        {exp.description}
                      </p>
                    )}
                    {idx < experiences.length - 1 && <hr className="border-border-color mt-4" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">Nenhuma experiência profissional cadastrada.</p>
          )}
        </div>

        {/* 4. EDUCATION (EDUCAÇÃO) SECTION */}
        <div className="bg-bg-card border border-border-color rounded-lg p-5 shadow-subtle transition-colors">
          <h3 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider">Formação Acadêmica</h3>
          {education && education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-bg-hover border border-border-color rounded-md flex items-center justify-center shrink-0 text-brand-blue shadow-sm">
                    <GraduationCap size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-text-primary">{edu.institution}</h4>
                    <p className="text-[11px] font-semibold text-text-primary/80 mt-0.5">{edu.degree}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{edu.duration}</p>
                    {idx < education.length - 1 && <hr className="border-border-color mt-4" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">Nenhuma formação acadêmica cadastrada.</p>
          )}
        </div>

        {/* 5. RAW TEXT EDITOR (IA PROMPT RESUME TEXT) */}
        <div className="bg-bg-card border border-border-color rounded-lg p-4 shadow-subtle transition-colors">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Currículo em Texto (Usado pela IA)</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                {resume.resumeFilename || 'Nenhum arquivo importado'}
              </p>
            </div>
            
            {isEditingResume ? (
              <Button size="sm" onClick={saveResume} icon={<Check size={13} />}>
                Salvar Texto
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setIsEditingResume(true)} icon={<Edit3 size={12} />}>
                Editar Texto
              </Button>
            )}
          </div>

          {isEditingResume ? (
            <Textarea
              value={resumeText}
              onChange={setResumeText}
              placeholder="Cole o texto bruto do currículo usado para responder formulários..."
              className="w-full h-48 text-xs font-mono"
            />
          ) : (
            <div className="bg-bg-hover border border-border-color rounded p-3 max-h-36 overflow-y-auto text-[11px] text-text-secondary/80 font-mono whitespace-pre-wrap leading-relaxed select-all">
              {resumeText || 'Nenhum currículo em texto cadastrado.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
