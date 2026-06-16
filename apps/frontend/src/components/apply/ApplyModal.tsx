import { AlertCircle, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import type { JobDetail, ApplyForm, FormQuestion, AIAnswer } from '../../types';
import { useApplyFormStore, useResumeStore } from '../../stores';

interface ApplyModalProps {
  job: JobDetail;
  applyForm: ApplyForm;
  onClose: () => void;
}

export function ApplyModal({ job, applyForm, onClose }: ApplyModalProps) {
  const {
    aiAnswers,
    generatingAnswers,
    formValues,
    updateFormValue,
    generateAnswers,
    currentStep,
    setCurrentStep,
  } = useApplyFormStore();

  const { resumeText, isEditingResume, setIsEditingResume, saveResume, setResumeText } = useResumeStore();

  const currentStepQuestions = applyForm.steps?.[currentStep]?.questions || [];

  const handleGenerateAnswers = async () => {
    if (!applyForm.questions || applyForm.questions.length === 0) return;
    await generateAnswers(applyForm.questions, resumeText);
  };

  const handleSubmit = () => {
    alert('A função de POST real para o LinkedIn pode ser adicionada pelo endpoint /api/jobs/:id/submit futuramente!\n\nDados preenchidos:\n' + JSON.stringify(formValues, null, 2));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="bg-[#121620] border border-white/10 max-w-2xl w-full rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        <ModalHeader job={job} onClose={onClose} />
        
        <ModalBody
          applyForm={applyForm}
          currentStep={currentStep}
          currentStepQuestions={currentStepQuestions}
          formValues={formValues}
          updateFormValue={updateFormValue}
          aiAnswers={aiAnswers}
          generatingAnswers={generatingAnswers}
          onGenerateAnswers={handleGenerateAnswers}
          resumeText={resumeText}
          isEditingResume={isEditingResume}
          setIsEditingResume={setIsEditingResume}
          onChangeResumeText={setResumeText}
          onSaveResume={saveResume}
        />

        <ModalFooter
          applyForm={applyForm}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  job: JobDetail;
  onClose: () => void;
}

function ModalHeader({ job, onClose }: ModalHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0d14]">
      <div>
        <h3 className="font-bold text-lg text-white">Candidatura Simplificada</h3>
        <p className="text-sm text-slate-400">{job.title} • {job.companyName}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-white p-2 transition-colors">
        ✕
      </button>
    </div>
  );
}

interface ModalBodyProps {
  applyForm: ApplyForm;
  currentStep: number;
  currentStepQuestions: FormQuestion[];
  formValues: Record<string, string>;
  updateFormValue: (urn: string, value: string) => void;
  aiAnswers: AIAnswer[];
  generatingAnswers: boolean;
  onGenerateAnswers: () => void;
  resumeText: string;
  isEditingResume: boolean;
  setIsEditingResume: (value: boolean) => void;
  onChangeResumeText: (value: string) => void;
  onSaveResume: () => void;
}

function ModalBody({
  applyForm,
  currentStep,
  currentStepQuestions,
  formValues,
  updateFormValue,
  aiAnswers,
  generatingAnswers,
  onGenerateAnswers,
  resumeText,
  isEditingResume,
  setIsEditingResume,
  onChangeResumeText,
  onSaveResume,
}: ModalBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
      {!applyForm.success ? (
        <ErrorMessage message={applyForm.message || 'Erro no formulário'} />
      ) : applyForm.steps && applyForm.steps.length > 0 ? (
        <div className="space-y-6">
          <StepIndicator steps={applyForm.steps} currentStep={currentStep} />
          
          <StepHeader
            title={applyForm.steps[currentStep].title}
            generatingAnswers={generatingAnswers}
            hasAiAnswers={aiAnswers.length > 0}
            onGenerateAnswers={onGenerateAnswers}
          />

          {isEditingResume && (
            <ResumeEditor
              resumeText={resumeText}
              onChange={onChangeResumeText}
              onSave={onSaveResume}
              onHide={() => setIsEditingResume(false)}
            />
          )}

          {!isEditingResume && resumeText.trim() === '' && (
            <ResumePrompt onClick={() => setIsEditingResume(true)} />
          )}

          <div className="space-y-5">
            {currentStepQuestions.map((q, i) => (
              <FormField
                key={i}
                question={q}
                value={formValues[q.urn] || ''}
                onChange={(value) => updateFormValue(q.urn, value)}
                hasAiAnswer={!!aiAnswers.find((ans) => ans.urn === q.urn)?.answer}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyFormMessage />
      )}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-amber-400 bg-amber-500/10 p-4 rounded-lg flex items-start gap-2 border border-amber-500/20 text-sm">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p className="font-medium">{message}</p>
    </div>
  );
}

interface StepIndicatorProps {
  steps: NonNullable<ApplyForm['steps']>;
  currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((_, idx: number) => (
        <div key={idx} className="flex-1 flex flex-col gap-2">
          <div className={`h-1.5 w-full rounded-full ${idx <= currentStep ? 'bg-blue-500' : 'bg-white/10'}`} />
          <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${idx === currentStep ? 'text-blue-400' : 'text-slate-500'}`}>
            {steps[idx].title}
          </span>
        </div>
      ))}
    </div>
  );
}

interface StepHeaderProps {
  title: string;
  generatingAnswers: boolean;
  hasAiAnswers: boolean;
  onGenerateAnswers: () => void;
}

function StepHeader({ title, generatingAnswers, hasAiAnswers, onGenerateAnswers }: StepHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold text-lg text-white">{title}</h3>
      <button
        onClick={onGenerateAnswers}
        disabled={generatingAnswers || hasAiAnswers}
        className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded font-bold text-xs hover:bg-purple-500/30 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
      >
        {generatingAnswers && <RefreshCw size={12} className="animate-spin" />}
        ✨ Auto-preencher Etapa
      </button>
    </div>
  );
}

interface ResumeEditorProps {
  resumeText: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onHide: () => void;
}

function ResumeEditor({ resumeText, onChange, onSave, onHide }: ResumeEditorProps) {
  return (
    <div className="bg-[#0a0d14] p-4 border border-white/10 rounded-lg mb-4">
      <h3 className="font-bold text-sm text-slate-200 mb-2">Seu Currículo (Base para IA)</h3>
      <Textarea
        value={resumeText}
        onChange={onChange}
        placeholder="Cole seu currículo em texto aqui..."
        className="w-full h-24 border border-white/10 bg-[#1a1f2e] text-white rounded p-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
      />
      <div className="flex gap-2 justify-end">
        <button onClick={onHide} className="text-xs px-3 py-1.5 text-slate-400 font-medium hover:text-white">
          Ocultar
        </button>
        <button onClick={onSave} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700">
          Salvar Currículo
        </button>
      </div>
    </div>
  );
}

function ResumePrompt({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs bg-amber-500/10 text-amber-400 px-3 py-2 rounded-md font-medium border border-amber-500/20 w-full mb-4 hover:bg-amber-500/20 transition-colors text-left flex items-center gap-2"
    >
      <AlertCircle size={14} /> Nenhum currículo cadastrado. Clique para adicionar e usar a IA.
    </button>
  );
}

function EmptyFormMessage() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
      <p>Esta vaga não possui formulário estruturado para candidatura simplificada ou já foi aplicada.</p>
    </div>
  );
}

interface FormFieldProps {
  question: FormQuestion;
  value: string;
  onChange: (value: string) => void;
  hasAiAnswer: boolean;
}

function FormField({ question, value, onChange, hasAiAnswer }: FormFieldProps) {
  const { urn, required, title, type, options } = question;

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
        {title}
        {required && <span className="text-xs font-normal text-red-400">*Obrigatório</span>}
      </label>

      {type === 'dropdown' || type === 'checkbox' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-white/10 rounded-md p-2.5 text-sm bg-[#0a0d14] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        >
          <option value="">Selecione uma opção...</option>
          {options?.map((opt: string, j: number) => (
            <option key={j} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === 'file' ? (
        <label className="border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/5 transition-colors rounded-md p-4 bg-[#0a0d14] flex items-center justify-center flex-col gap-2 cursor-pointer relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file.name);
              }
            }}
          />
          {value ? (
            <div className="flex flex-col items-center gap-2 text-blue-400">
              <CheckCircle size={24} />
              <span className="text-sm font-medium">{value}</span>
            </div>
          ) : (
            <>
              <FileText size={24} className="text-slate-500" />
              <span className="text-sm text-slate-400 font-medium">
                Carregar documento ({options?.join(', ') || 'PDF, DOCX'})
              </span>
            </>
          )}
        </label>
      ) : (
        <Input
          value={value}
          onChange={onChange}
          placeholder="Sua resposta..."
        />
      )}

      {hasAiAnswer && (
        <span className="absolute right-3 top-9 text-purple-400" title="Preenchido por IA">
          ✨
        </span>
      )}
    </div>
  );
}

interface ModalFooterProps {
  applyForm: ApplyForm;
  currentStep: number;
  setCurrentStep: (value: number) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function ModalFooter({ applyForm, currentStep, setCurrentStep, onClose, onSubmit }: ModalFooterProps) {
  const hasSteps = applyForm.success && applyForm.steps && applyForm.steps.length > 0;
  const isLastStep = hasSteps && currentStep === applyForm.steps!.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="px-6 py-4 border-t border-white/5 bg-[#0a0d14] flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        Cancelar
      </button>

      {hasSteps && (
        <>
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 text-sm font-semibold border border-white/20 bg-transparent text-slate-300 hover:bg-white/5 rounded-lg transition-colors shadow-sm"
            >
              Voltar
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Avançar Etapa
            </button>
          ) : (
            <button
              onClick={onSubmit}
              className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-sm border-0"
            >
              Finalizar Candidatura
            </button>
          )}
        </>
      )}
    </div>
  );
}
