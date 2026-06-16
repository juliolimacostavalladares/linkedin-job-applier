import { FileText, RefreshCw } from 'lucide-react';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import type { ResumeState } from '../../stores';

interface ResumeViewProps {
  resume: ResumeState;
}

export function ResumeView({ resume }: ResumeViewProps) {
  const {
    resumeText, setResumeText,
    profileId, setProfileId,
    isFetchingPdf, pdfError,
    saveResume, fetchLinkedInPdf,
  } = resume;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-bg-app relative scrollbar-hide transition-colors duration-200">
      <div className="max-w-3xl mx-auto w-full relative z-10 space-y-4">
        <ResumeHeader />

        <LinkedInImportCard
          profileId={profileId}
          onProfileIdChange={setProfileId}
          isFetchingPdf={isFetchingPdf}
          pdfError={pdfError}
          onFetch={fetchLinkedInPdf}
        />

        <ResumeTextCard
          resumeText={resumeText}
          onChange={setResumeText}
          onSave={saveResume}
        />
      </div>
    </div>
  );
}

function ResumeHeader() {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-11 h-11 bg-bg-hover border border-border-color rounded-lg flex items-center justify-center shrink-0 shadow-sm">
        <FileText size={20} className="text-brand-blue" />
      </div>
      <div>
        <h1 className="text-lg md:text-xl font-bold text-text-primary tracking-tight">Meu Currículo</h1>
        <p className="text-text-secondary text-xs mt-0.5">Este currículo será usado pela IA para preencher candidaturas automaticamente.</p>
      </div>
    </div>
  );
}

interface LinkedInImportCardProps {
  profileId: string;
  onProfileIdChange: (value: string) => void;
  isFetchingPdf: boolean;
  pdfError: string;
  onFetch: () => void;
}

function LinkedInImportCard({ profileId, onProfileIdChange, isFetchingPdf, pdfError, onFetch }: LinkedInImportCardProps) {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-4 shadow-sm w-full transition-colors">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-text-primary">Importar do LinkedIn</h2>
        <p className="text-text-secondary text-xs mt-0.5">Extraia automaticamente o texto do PDF do seu perfil.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={profileId}
          onChange={onProfileIdChange}
          placeholder="ID do Perfil (Ex: ACoAA...)"
          className="flex-1"
        />
        <Button
          variant="secondary"
          onClick={onFetch}
          disabled={isFetchingPdf}
          icon={isFetchingPdf ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        >
          {isFetchingPdf ? 'Baixando...' : 'Extrair Perfil'}
        </Button>
      </div>
      {pdfError && <p className="text-red-500 text-xs mt-2 font-medium">{pdfError}</p>}
    </div>
  );
}

interface ResumeTextCardProps {
  resumeText: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

function ResumeTextCard({ resumeText, onChange, onSave }: ResumeTextCardProps) {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-4 shadow-sm w-full transition-colors">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold text-text-primary">Texto do Currículo</h2>
        <Button onClick={onSave} size="sm">Salvar</Button>
      </div>
      <Textarea
        value={resumeText}
        onChange={onChange}
        placeholder="Cole o texto do seu currículo aqui para otimizar as candidaturas..."
        className="w-full h-[55vh] min-h-[250px]"
      />
    </div>
  );
}
