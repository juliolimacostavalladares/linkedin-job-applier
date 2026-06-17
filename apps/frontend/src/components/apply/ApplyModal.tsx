import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, CheckCircle, FileText, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import type { JobDetail, ApplyForm, FormQuestion } from '../../types';
import { useApplyFormStore, useResumeStore, useJobsStore } from '../../stores';

interface ApplyModalProps {
  job: JobDetail;
  onClose: () => void;
}

export function ApplyModal({ job, onClose }: ApplyModalProps) {
  const {
    applyForm,
    loadingForm,
    errorForm,
    fetchApplyForm,
    formValues,
    updateFormValue,
    currentStep,
    setCurrentStep,
    optimizedResume,
    optimizedResumePdfBase64,
  } = useApplyFormStore();

  const { resumeText, isEditingResume, setIsEditingResume, saveResume, setResumeText, name: userName } = useResumeStore();
  const { applyJob } = useJobsStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStepQuestions = applyForm?.steps?.[currentStep]?.questions || [];

  const handleSaveResume = async () => {
    await saveResume();
    await fetchApplyForm(job.id, job.title, job.companyName || job.companyInfo, userName || undefined);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const questionTitles: Record<string, string> = {};
      if (applyForm) {
        if (applyForm.questions) {
          applyForm.questions.forEach((q) => {
            questionTitles[q.urn] = q.title;
          });
        }
        if (applyForm.steps) {
          applyForm.steps.forEach((step) => {
            if (step.questions) {
              step.questions.forEach((q) => {
                questionTitles[q.urn] = q.title;
              });
            }
          });
        }
      }

      await applyJob(job.id, formValues, {
        jobTitle: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        jobUrl: job.url,
        optimizedResume,
        questionTitles,
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
           loadingForm={loadingForm}
           errorForm={errorForm}
           currentStep={currentStep}
           currentStepQuestions={currentStepQuestions}
           formValues={formValues}
           updateFormValue={updateFormValue}
           resumeText={resumeText}
           isEditingResume={isEditingResume}
           setIsEditingResume={setIsEditingResume}
           onChangeResumeText={setResumeText}
           onSaveResume={handleSaveResume}
           submitError={submitError}
           optimizedResume={optimizedResume}
           optimizedResumePdfBase64={optimizedResumePdfBase64}
         />

        <ModalFooter
          applyForm={applyForm}
          loadingForm={loadingForm}
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
  applyForm: ApplyForm | null;
  loadingForm: boolean;
  errorForm: string | null;
  currentStep: number;
  currentStepQuestions: FormQuestion[];
  formValues: Record<string, string>;
  updateFormValue: (urn: string, value: string) => void;
  resumeText: string;
  isEditingResume: boolean;
  setIsEditingResume: (value: boolean) => void;
  onChangeResumeText: (value: string) => void;
  onSaveResume: () => void;
  submitError?: string | null;
  optimizedResume: string;
  optimizedResumePdfBase64: string;
}

function ModalBody({
  applyForm,
  loadingForm,
  errorForm,
  currentStep,
  currentStepQuestions,
  formValues,
  updateFormValue,
  resumeText,
  isEditingResume,
  setIsEditingResume,
  onChangeResumeText,
  onSaveResume,
  submitError,
  optimizedResume,
  optimizedResumePdfBase64,
}: ModalBodyProps) {
  if (loadingForm) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
        <RefreshCw size={24} className="animate-spin text-brand-blue" />
        <p className="text-xs font-semibold">Carregando formulário e gerando respostas com IA...</p>
      </div>
    );
  }

  if (errorForm) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-transparent">
        <ErrorMessage message={errorForm} />
      </div>
    );
  }

  if (!applyForm) return null;

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
          />

          {optimizedResume && (
            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-md p-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-brand-blue font-bold mb-1">
                <Sparkles size={14} className="fill-brand-blue/20" />
                <span>Currículo ATS Otimizado por IA</span>
              </div>
              <p className="text-text-secondary mb-2">
                Um currículo sob medida para esta vaga foi gerado para preencher as perguntas e será salvo caso a candidatura seja concluída.
              </p>
              <details className="cursor-pointer group">
                <summary className="text-[10px] font-bold text-brand-blue/80 hover:text-brand-blue uppercase tracking-wider select-none mb-2 block">
                  Visualizar Currículo Otimizado
                </summary>
                {optimizedResumePdfBase64 ? (
                  <div className="mt-2 border border-border-color rounded-md overflow-hidden bg-bg-input">
                    <object
                      data={`data:application/pdf;base64,${optimizedResumePdfBase64}`}
                      type="application/pdf"
                      className="w-full h-96"
                    >
                      <iframe
                        src={`data:application/pdf;base64,${optimizedResumePdfBase64}`}
                        className="w-full h-96 border-0"
                        title="Preview do Currículo Otimizado"
                      />
                    </object>
                  </div>
                ) : (
                  <pre className="mt-2 p-2 bg-bg-input rounded border border-border-color font-mono text-[10px] max-h-36 overflow-y-auto whitespace-pre-wrap text-text-primary">
                    {optimizedResume}
                  </pre>
                )}
              </details>
            </div>
          )}

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
                hasAiAnswer={!!q.suggestedAnswer}
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
}

function StepHeader({ title }: StepHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">{title}</h4>
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


function DateRangePicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  let startYear = '';
  let startMonth = '';
  let endYear = '';
  let endMonth = '';

  if (value) {
    try {
      const parsed = JSON.parse(value);
      startYear = parsed.start?.year ? String(parsed.start.year) : '';
      startMonth = parsed.start?.month ? String(parsed.start.month) : '';
      endYear = parsed.end?.year ? String(parsed.end.year) : '';
      endMonth = parsed.end?.month ? String(parsed.end.month) : '';
    } catch {}
  }

  const months = [
    { value: '1', label: 'Jan' },
    { value: '2', label: 'Fev' },
    { value: '3', label: 'Mar' },
    { value: '4', label: 'Abr' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Ago' },
    { value: '9', label: 'Set' },
    { value: '10', label: 'Out' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dez' },
  ];

  const update = (sMonth: string, sYear: string, eMonth: string, eYear: string) => {
    if (sMonth && sYear) {
      onChange(
        JSON.stringify({
          start: { year: parseInt(sYear), month: parseInt(sMonth), day: 1 },
          ...(eMonth && eYear
            ? { end: { year: parseInt(eYear), month: parseInt(eMonth), day: 1 } }
            : {}),
        })
      );
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border border-border-color rounded-lg bg-bg-input">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-text-secondary/70 w-8">De:</span>
        <select
          value={startMonth}
          onChange={(e) => update(e.target.value, startYear, endMonth, endYear)}
          className="border border-border-color rounded bg-bg-card text-text-primary p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue w-24 transition-colors"
        >
          <option value="">Mês</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Ano"
          value={startYear}
          onChange={(val) => update(startMonth, val, endMonth, endYear)}
          className="py-1.5 px-2.5 text-xs w-20"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-text-secondary/70 w-8">Até:</span>
        <select
          value={endMonth}
          onChange={(e) => update(startMonth, startYear, e.target.value, endYear)}
          className="border border-border-color rounded bg-bg-card text-text-primary p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue w-24 transition-colors"
        >
          <option value="">Mês</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Ano"
          value={endYear}
          onChange={(val) => update(startMonth, startYear, endMonth, val)}
          className="py-1.5 px-2.5 text-xs w-20"
        />
      </div>
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
      ) : type === 'date-range' ? (
        <div className="relative w-full">
          <DateRangePicker value={value} onChange={onChange} />
          {hasAiAnswer && (
            <span className="absolute right-3 top-3 text-brand-blue flex items-center pointer-events-none animate-pulse" title="Sugerido por IA">
              <Sparkles size={13} className="fill-brand-blue/20" />
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex items-center w-full bg-transparent">
          {type === 'dropdown' || type === 'checkbox' ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="border border-border-color rounded-lg bg-bg-input text-text-primary p-2.5 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue w-full transition-all duration-150"
            >
              <option value="">Selecione uma opção...</option>
              {options?.map((opt: string, j: number) => (
                <option key={j} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : type === 'multiline-text' ? (
            <Textarea
              value={value}
              onChange={onChange}
              placeholder="Sua resposta detalhada..."
              className="py-2 pl-2.5 pr-8 text-xs w-full min-h-[80px]"
            />
          ) : (
            <Input
              value={value}
              onChange={onChange}
              placeholder="Sua resposta..."
              className="py-2.5 pl-2.5 pr-8 text-xs w-full"
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
  applyForm: ApplyForm | null;
  loadingForm: boolean;
  currentStep: number;
  setCurrentStep: (value: number) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}

function ModalFooter({ applyForm, loadingForm, currentStep, setCurrentStep, onClose, onSubmit, submitting }: ModalFooterProps) {
  if (loadingForm || !applyForm) return null;
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
