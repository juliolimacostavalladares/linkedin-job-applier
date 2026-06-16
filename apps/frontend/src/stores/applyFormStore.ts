import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { FormQuestion, AIAnswer } from '../types';

interface ApplyFormState {
  aiAnswers: AIAnswer[];
  generatingAnswers: boolean;
  formValues: Record<string, string>;
  isApplyModalOpen: boolean;
  currentStep: number;
  updateFormValue: (urn: string, value: string) => void;
  generateAnswers: (questions: FormQuestion[], resume: string) => Promise<void>;
  setIsApplyModalOpen: (open: boolean) => void;
  setCurrentStep: (step: number) => void;
  closeModal: () => void;
}

export const useApplyFormStore = create<ApplyFormState>((set, get) => ({
  aiAnswers: [],
  generatingAnswers: false,
  formValues: {},
  isApplyModalOpen: false,
  currentStep: 0,
  updateFormValue: (urn, value) => {
    set((state) => ({
      formValues: { ...state.formValues, [urn]: value },
    }));
  },
  generateAnswers: async (questions, resume) => {
    set({ generatingAnswers: true });
    try {
      const { data } = await apiService.generateAnswers(questions, resume);
      const newValues: Record<string, string> = {};
      data.answers.forEach((ans: AIAnswer) => {
        if (ans.answer) {
          newValues[ans.urn] = ans.answer;
        }
      });
      
      set((state) => ({
        aiAnswers: data.answers,
        formValues: { ...state.formValues, ...newValues },
        generatingAnswers: false,
      }));
    } catch (err: unknown) {
      alert('Erro ao conectar com a IA.');
      set({ generatingAnswers: false });
    }
  },
  setIsApplyModalOpen: (open) => set({ isApplyModalOpen: open }),
  setCurrentStep: (step) => set({ currentStep: step }),
  closeModal: () => set({
    isApplyModalOpen: false,
    aiAnswers: [],
    formValues: {},
    currentStep: 0,
  }),
}));
