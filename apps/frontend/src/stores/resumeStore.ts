import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';

export interface ResumeState {
  resumeText: string;
  resumeFilename: string;
  profileId: string;
  isFetchingPdf: boolean;
  pdfError: string;
  isEditingResume: boolean;
  setResumeText: (text: string) => void;
  setProfileId: (id: string) => void;
  setIsEditingResume: (editing: boolean) => void;
  saveResume: () => void;
  fetchLinkedInPdf: () => Promise<void>;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumeText: '',
      resumeFilename: '',
      profileId: '',
      isFetchingPdf: false,
      pdfError: '',
      isEditingResume: false,
      setResumeText: (text) => set({ resumeText: text }),
      setProfileId: (id) => set({ profileId: id }),
      setIsEditingResume: (editing) => set({ isEditingResume: editing }),
      saveResume: () => set({ isEditingResume: false }),
      fetchLinkedInPdf: async () => {
        const { profileId } = get();
        if (!profileId.trim()) {
          set({ pdfError: 'Profile ID é obrigatório' });
          return;
        }
        
        set({ isFetchingPdf: true, pdfError: '' });
        try {
          const { data } = await apiService.fetchResumeFromLinkedIn(profileId.trim());
          set({
            resumeText: data.text,
            resumeFilename: 'Curriculo_LinkedIn.pdf',
            isFetchingPdf: false,
          });
          alert('Currículo importado com sucesso do LinkedIn!');
        } catch (err: unknown) {
          set({
            pdfError: err instanceof Error ? err.message : 'Falha na requisição',
            isFetchingPdf: false,
          });
        }
      },
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
      }),
    }
  )
);
