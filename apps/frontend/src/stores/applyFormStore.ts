import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { FormQuestion, ApplyForm } from '../types';

interface ApplyFormState {
  applyForm: ApplyForm | null;
  optimizedResume: string;
  optimizedResumePdfBase64: string;
  loadingForm: boolean;
  errorForm: string | null;
  formValues: Record<string, string>;
  isApplyModalOpen: boolean;
  currentStep: number;
  updateFormValue: (urn: string, value: string) => void;
  fetchApplyForm: (jobId: string, jobTitle?: string, companyName?: string, userName?: string) => Promise<void>;
  setIsApplyModalOpen: (open: boolean) => void;
  setCurrentStep: (step: number) => void;
  closeModal: () => void;
}

export const useApplyFormStore = create<ApplyFormState>((set, get) => ({
  applyForm: null,
  optimizedResume: '',
  optimizedResumePdfBase64: '',
  loadingForm: false,
  errorForm: null,
  formValues: {},
  isApplyModalOpen: false,
  currentStep: 0,
  updateFormValue: (urn, value) => {
    set((state) => ({
      formValues: { ...state.formValues, [urn]: value },
    }));
  },
  fetchApplyForm: async (jobId, jobTitle, companyName, userName) => {
    set({ loadingForm: true, errorForm: null, applyForm: null, optimizedResume: '', optimizedResumePdfBase64: '' });
    try {
      const response = await apiService.getApplyForm(jobId);
      const data: ApplyForm = response.data;
      const initialValues: Record<string, string> = {};

      const cleanString = (str?: string) => {
        if (!str) return '';
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // remove accents
          .replace(/[^a-zA-Z0-9]/g, '_') // replace non-alphanumeric with underscore
          .replace(/_+/g, '_') // collapse multiple underscores
          .replace(/(^_|_$)/g, ''); // trim leading/trailing underscores
      };

      const parts: string[] = [];
      if (userName) parts.push(cleanString(userName));
      
      const companyOrTitle = companyName ? companyName : jobTitle;
      if (companyOrTitle) parts.push(cleanString(companyOrTitle));
      
      const filename = parts.length > 0 ? `${parts.join('_')}.pdf` : 'curriculo_otimizado.pdf';

      if (data.questions) {
        data.questions.forEach((q: FormQuestion) => {
          if (q.type === 'file' && data.optimizedResume) {
            initialValues[q.urn] = filename;
          } else {
            initialValues[q.urn] = q.prefilledValue || q.suggestedAnswer || '';
          }
        });
      }
      if (data.steps) {
        data.steps.forEach((step) => {
          if (step.questions) {
            step.questions.forEach((q: FormQuestion) => {
              if (initialValues[q.urn] === undefined) {
                if (q.type === 'file' && data.optimizedResume) {
                  initialValues[q.urn] = filename;
                } else {
                  initialValues[q.urn] = q.prefilledValue || q.suggestedAnswer || '';
                }
              }
            });
          }
        });
      }
      set({
        applyForm: data,
        optimizedResume: data.optimizedResume || '',
        optimizedResumePdfBase64: data.optimizedResumePdfBase64 || '',
        formValues: initialValues,
        loadingForm: false,
      });
    } catch (err: unknown) {
      let message = 'Erro ao carregar o formulário';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        message = axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ errorForm: message, loadingForm: false });
    }
  },
  setIsApplyModalOpen: (open) => set({ isApplyModalOpen: open }),
  setCurrentStep: (step) => set({ currentStep: step }),
  closeModal: () => set({
    isApplyModalOpen: false,
    applyForm: null,
    optimizedResume: '',
    optimizedResumePdfBase64: '',
    errorForm: null,
    formValues: {},
    currentStep: 0,
  }),
}));

