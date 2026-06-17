import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { FormQuestion, ApplyForm } from '../types';

interface ApplyFormState {
  applyForm: ApplyForm | null;
  loadingForm: boolean;
  errorForm: string | null;
  formValues: Record<string, string>;
  isApplyModalOpen: boolean;
  currentStep: number;
  updateFormValue: (urn: string, value: string) => void;
  fetchApplyForm: (jobId: string) => Promise<void>;
  setIsApplyModalOpen: (open: boolean) => void;
  setCurrentStep: (step: number) => void;
  closeModal: () => void;
}

export const useApplyFormStore = create<ApplyFormState>((set, get) => ({
  applyForm: null,
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
  fetchApplyForm: async (jobId) => {
    set({ loadingForm: true, errorForm: null, applyForm: null });
    try {
      const { data } = await apiService.getApplyForm(jobId);
      const initialValues: Record<string, string> = {};
      if (data.questions) {
        data.questions.forEach((q: FormQuestion) => {
          initialValues[q.urn] = q.prefilledValue || q.suggestedAnswer || '';
        });
      }
      set({
        applyForm: data,
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
    errorForm: null,
    formValues: {},
    currentStep: 0,
  }),
}));

