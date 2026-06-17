import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, CheckCircle, FileText, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import type { JobDetail, ApplyForm, FormQuestion, AIAnswer } from '../../types';
import { useApplyFormStore, useResumeStore, useJobsStore } from '../../stores';

interface ApplyModalProps {
  job: JobDetail;
  applyForm: ApplyForm;
  onClose: () => void;
}

export function ApplyModal({ job, applyForm, onClose }: ApplyModalProps) {
  const {
    formValues,
    updateFormValue,
    currentStep,
    setCurrentStep,
    generateAnswers,
    generatingAnswers,
    aiAnswers,
  } = useApplyFormStore();

  const { resumeText, isEditingResume, setIsEditingResume, saveResume, setResumeText } = useResumeStore();
  const { applyJob } = useJobsStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStepQuestions = applyForm.steps?.[currentStep]?.questions || [];

  const handleGenerateAnswers = async () => {
    if (!applyForm.questions || applyForm.questions.length === 0) return;
    await generateAnswers(applyForm.questions, resumeText);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await applyJob(job.id, formValues, {
        jobTitle: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        jobUrl: job.url,
      });
      alert('Candidatura finalizada com sucesso!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar candidatura';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-bg-card border border-border-color max-w-lg w-full rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden transition-all duration-200">
        <ModalHeader job={job} onClose={onClose} />
        
        <ModalBody
          applyForm={applyForm}
          currentStep={currentStep}
          currentStepQuestions={currentStepQuestions}
          formValues={formValues}
          updateFormValue={updateFormValue}
          onGenerateAnswers={handleGenerateAnswers}
          aiAnswers={aiAnswers}
          generatingAnswers={generatingAnswers}
          resumeText={resumeText}
          isEditingResume={isEditingResume}
          setIsEditingResume={setIsEditingResume}
          onChangeResumeText={setResumeText}
          onSaveResume={saveResume}
          submitError={submitError}
        />

        <ModalFooter
          applyForm={applyForm}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onClose={onClose}
          onSubmit={handleSubmit}
          submitting={submitting}
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
    <div className="px-4 py-3 border-b border-border-color flex justify-between items-center bg-bg-card transition-colors">
      <div>
        <h3 className="font-bold text-sm text-text-primary">Candidatura Simplificada</h3>
        <p className="text-xs text-text-secondary">{job.title} • {job.companyName}</p>
      </div>
      <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1.5 rounded hover:bg-bg-hover transition-colors">
        <X size={16} />
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
  onGenerateAnswers: () => void;
  aiAnswers: AIAnswer[];
  generatingAnswers: boolean;
  resumeText: string;
  isEditingResume: boolean;
  setIsEditingResume: (value: boolean) => void;
  onChangeResumeText: (value: string) => void;
  onSaveResume: () => void;
  submitError?: string | null;
}

function ModalBody({
  applyForm,
  currentStep,
  currentStepQuestions,
  formValues,
  updateFormValue,
  onGenerateAnswers,
  aiAnswers,
  generatingAnswers,
  resumeText,
  isEditingResume,
  setIsEditingResume,
  onChangeResumeText,
  onSaveResume,
  submitError,
}: ModalBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-transparent">
      {submitError && <ErrorMessage message={submitError} />}
      {!applyForm.success ? (
        <ErrorMessage message={applyForm.message || 'Erro no formulário'} />
      ) : applyForm.steps && applyForm.steps.length > 0 ? (
        <div className="space-y-4">
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

          <div className="space-y-3.5">
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
    <div className="text-red-500 bg-red-500/10 p-3 rounded-md flex items-start gap-1.5 border border-red-500/20 text-xs">
      <AlertCircle size={14} className="shrink-0 mt-0.5" />
      <p className="font-semibold">{message}</p>
    </div>
  );
}

interface StepIndicatorProps {
  steps: NonNullable<ApplyForm['steps']>;
  currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {steps.map((_, idx: number) => (
        <div key={idx} className="flex-1 flex flex-col gap-1">
          <div className={`h-1 w-full rounded-full ${idx <= currentStep ? 'bg-brand-blue' : 'bg-border-color'}`} />
          <span className={`text-[9px] uppercase font-bold tracking-wider truncate ${idx === currentStep ? 'text-brand-blue' : 'text-text-secondary/50'}`}>
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
    <div className="flex items-center justify-between mb-1">
      <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">{title}</h4>
      <button
        onClick={onGenerateAnswers}
        disabled={generatingAnswers || hasAiAnswers}
        className="bg-transparent border border-border-color text-brand-blue px-2.5 py-1 rounded font-bold text-[11px] hover:bg-bg-hover hover:border-brand-blue flex items-center gap-1 disabled:opacity-50 transition-colors shadow-sm"
      >
        {generatingAnswers ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
        Auto-preencher
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
    <div className="bg-bg-hover p-3 border border-border-color rounded-md mb-3">
      <h4 className="font-bold text-xs text-text-primary mb-1.5">Editar Currículo Base</h4>
      <Textarea
        value={resumeText}
        onChange={onChange}
        placeholder="Cole seu currículo em texto aqui..."
        className="w-full h-24 mb-2 p-2 min-h-[80px]"
      />
      <div className="flex gap-1.5 justify-end">
        <button onClick={onHide} className="text-xs px-2.5 py-1 text-text-secondary font-semibold hover:text-text-primary">
          Cancelar
        </button>
        <button onClick={onSave} className="text-xs bg-brand-blue text-white px-3 py-1 rounded font-bold hover:bg-brand-blue-hover">
          Salvar
        </button>
      </div>
    </div>
  );
}

function ResumePrompt({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-2 rounded border border-amber-500/20 w-full mb-3 hover:bg-amber-500/20 transition-colors text-left flex items-center gap-1.5"
    >
      <AlertCircle size={13} />
      <span>Nenhum currículo cadastrado. Clique para cadastrar e usar IA.</span>
    </button>
  );
}

function EmptyFormMessage() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center text-text-secondary">
      <p className="text-xs">Esta vaga não possui formulário estruturado para candidatura simplificada.</p>
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
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-text-primary flex items-center justify-between">
        <span>
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </label>

      {type === 'file' ? (
        <div className="relative w-full">
          <label className="border border-dashed border-border-color hover:border-brand-blue hover:bg-bg-hover transition-colors rounded p-3 bg-bg-input flex items-center justify-center flex-col gap-1.5 cursor-pointer relative">
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
              <div className="flex flex-col items-center gap-1 text-brand-blue">
                <CheckCircle size={20} />
                <span className="text-xs font-semibold">{value}</span>
              </div>
            ) : (
              <>
                <FileText size={20} className="text-text-secondary/60" />
                <span className="text-xs text-text-secondary font-medium">
                  Carregar documento ({options?.join(', ') || 'PDF, DOCX'})
                </span>
              </>
            )}
          </label>
          {hasAiAnswer && (
            <span className="absolute right-3 top-3 text-brand-blue flex items-center pointer-events-none animate-pulse" title="Sugerido por IA">
              <Sparkles size={13} className="fill-brand-blue/20" />
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex items-center w-full">
          {type === 'dropdown' || type === 'checkbox' ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="border border-border-color rounded bg-bg-input text-text-primary p-2 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue w-full transition-all duration-150"
            >
              <option value="">Selecione uma opção...</option>
              {options?.map((opt: string, j: number) => (
                <option key={j} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={value}
              onChange={onChange}
              placeholder="Sua resposta..."
              className="py-2 pl-2.5 pr-8 text-xs w-full"
            />
          )}

          {hasAiAnswer && (
            <span 
              className={`absolute ${type === 'dropdown' || type === 'checkbox' ? 'right-7.5' : 'right-3'} text-brand-blue flex items-center pointer-events-none animate-pulse`} 
              title="Sugerido por IA"
            >
              <Sparkles size={13} className="fill-brand-blue/20" />
            </span>
          )}
        </div>
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
  submitting?: boolean;
}

function ModalFooter({ applyForm, currentStep, setCurrentStep, onClose, onSubmit, submitting }: ModalFooterProps) {
  const hasSteps = applyForm.success && applyForm.steps && applyForm.steps.length > 0;
  const isLastStep = hasSteps && currentStep === applyForm.steps!.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="px-4 py-3 border-t border-border-color bg-bg-card flex justify-end gap-2 transition-colors">
      <button
        onClick={onClose}
        disabled={submitting}
        className="px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-hover hover:text-text-primary rounded-md transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>

      {hasSteps && (
        <>
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-semibold border border-border-color bg-transparent text-text-primary hover:bg-bg-hover rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              Voltar
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue-hover rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              Avançar
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue-hover rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting && <RefreshCw size={11} className="animate-spin" />}
              Finalizar Candidatura
            </button>
          )}
        </>
      )}
    </div>
  );
}
