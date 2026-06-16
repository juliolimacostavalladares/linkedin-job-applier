import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import type { WorkExperience, Education } from '@linkedin-job-applier/shared';

export interface ResumeState {
  resumeText: string;
  resumeFilename: string;
  profileId: string | null;
  name: string | null;
  headline: string | null;
  photoUrl: string | null;
  about: string | null;
  experiences: WorkExperience[];
  education: Education[];
  isFetchingProfile: boolean;
  profileError: string;
  isEditingResume: boolean;
  setResumeText: (text: string) => void;
  setIsEditingResume: (editing: boolean) => void;
  saveResume: () => Promise<void>;
  fetchProfile: (sync?: boolean) => Promise<void>;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumeText: '',
      resumeFilename: '',
      profileId: null,
      name: null,
      headline: null,
      photoUrl: null,
      about: null,
      experiences: [],
      education: [],
      isFetchingProfile: false,
      profileError: '',
      isEditingResume: false,

      setResumeText: (text) => set({ resumeText: text }),
      setIsEditingResume: (editing) => set({ isEditingResume: editing }),
      
      saveResume: async () => {
        const { resumeText } = get();
        set({ isFetchingProfile: true, profileError: '' });
        try {
          await apiService.saveResumeText(resumeText);
          set({ isEditingResume: false, isFetchingProfile: false });
        } catch (err: unknown) {
          set({
            profileError: err instanceof Error ? err.message : 'Falha ao salvar currículo',
            isFetchingProfile: false,
          });
        }
      },

      fetchProfile: async (sync = false) => {
        set({ isFetchingProfile: true, profileError: '' });
        try {
          const { data } = await apiService.getProfile(sync);
          set({
            profileId: data.profileId || null,
            name: data.name || null,
            headline: data.headline || null,
            photoUrl: data.photoUrl || null,
            about: data.about || null,
            experiences: data.experiences || [],
            education: data.education || [],
            resumeText: data.text || '',
            resumeFilename: data.filename || 'Curriculo_LinkedIn.pdf',
            isFetchingProfile: false,
          });
        } catch (err: unknown) {
          let message = 'Falha ao carregar perfil do LinkedIn';
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            message = axiosErr.response?.data?.error || message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          set({
            profileError: message,
            isFetchingProfile: false,
          });
        }
      },
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({
        resumeText: state.resumeText,
        resumeFilename: state.resumeFilename,
        name: state.name,
        headline: state.headline,
        photoUrl: state.photoUrl,
        about: state.about,
        experiences: state.experiences,
        education: state.education,
        profileId: state.profileId,
      }),
    }
  )
);
