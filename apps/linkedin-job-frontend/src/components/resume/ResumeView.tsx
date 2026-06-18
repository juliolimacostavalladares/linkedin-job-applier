import { useEffect } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  Edit3, 
  Check 
} from 'lucide-react';
import { ProfileView as SharedProfileView } from '@linkedin-job-applier/shared';
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

  const profileData = {
    profileId: resume.profileId,
    name,
    headline,
    photoUrl,
    about,
    experiences: experiences || [],
    education: education || []
  };

  return (
    <SharedProfileView
      profile={profileData}
      onRefresh={() => fetchProfile(true)}
      isRefreshing={isFetchingProfile}
      emptyStateText="Para preencher seu currículo automaticamente, utilize a extensão do Chrome JobFinder Sync para sincronizar suas informações."
      syncSourceText="Sincronizado via Extensão"
    >
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

      {/* 5. RAW TEXT EDITOR (IA PROMPT RESUME TEXT) */}
      <div className="bg-bg-card border border-border-color rounded-xl p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex justify-between items-center pb-2 border-b border-border-color/45">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Currículo em Texto (Usado pela IA)</h3>
            <p className="text-[10px] text-text-secondary mt-0.5 font-mono">
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
          <div className="bg-bg-hover border border-border-color rounded-lg p-3 max-h-36 overflow-y-auto text-[11px] text-text-secondary/80 font-mono whitespace-pre-wrap leading-relaxed select-all">
            {resumeText || 'Nenhum currículo em texto cadastrado.'}
          </div>
        )}
      </div>
    </SharedProfileView>
  );
}
