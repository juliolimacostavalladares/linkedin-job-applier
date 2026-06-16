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
    <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto bg-[#0a0d14] relative scrollbar-hide">
      <div className="max-w-4xl mx-auto w-full relative z-10">
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
    <div className="flex items-center gap-4 mb-8">
      <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center shrink-0">
        <FileText size={24} className="text-purple-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Meu Currículo</h1>
        <p className="text-slate-400 text-sm mt-1">Este currículo será usado pela IA para preencher candidaturas automaticamente.</p>
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
    <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 shadow-xl w-full mb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-200">Importar do LinkedIn</h2>
          <p className="text-slate-400 text-sm mt-1">Extraia automaticamente o texto do PDF do seu perfil.</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
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
          icon={isFetchingPdf ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        >
          {isFetchingPdf ? 'Baixando e Extraindo...' : 'Extrair PDF'}
        </Button>
      </div>
      {pdfError && <p className="text-red-400 text-sm mt-3">{pdfError}</p>}
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
    <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 shadow-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-200">Texto do Currículo</h2>
        <Button onClick={onSave}>Salvar Currículo</Button>
      </div>
      <Textarea
        value={resumeText}
        onChange={onChange}
        placeholder="Cole todo o texto do seu currículo aqui..."
        className="w-full h-[50vh] min-h-[300px]"
      />
    </div>
  );
}
