import { create } from 'zustand';
import axios from 'axios';
import { apiService } from '../services/apiService';
import type { Job, JobDetail } from '../types';

interface JobsState {
  jobs: Job[];
  selectedJob: JobDetail | null;
  selectedJobId: string | null;
  loadingList: boolean;
  loadingDetail: boolean;
  loading: boolean;
  error: string;
  credentialError: boolean;
  fetchJobs: () => Promise<void>;
  selectJob: (job: Job) => Promise<void>;
  applyJob: (jobId: string, answers: Record<string, string>) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  selectedJob: null,
  selectedJobId: null,
  loadingList: false,
  loadingDetail: false,
  loading: false,
  error: '',
  credentialError: false,

  fetchJobs: async () => {
    set({ loadingList: true, loading: true, error: '', credentialError: false });
    try {
      const { data } = await apiService.getJobs();
      set({ jobs: data.jobs || [], loadingList: false, loading: false });
    } catch (err: unknown) {
      let message = 'Erro desconhecido';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ 
        error: message,
        loadingList: false,
        loading: false,
        credentialError: message.includes('Credenciais'),
      });
    }
  },

  selectJob: async (job: Job) => {
    set({ selectedJobId: job.id, loadingDetail: true, error: '', credentialError: false });
    try {
      const { data } = await apiService.getJobDetail(job.id);
      // Mescla com os dados da listagem (logo e companyInfo vêm de lá)
      set({
        selectedJob: {
          ...data,
          companyLogo: data.companyLogo || job.companyLogo || undefined,
          companyName: data.companyName || data.companyInfo || job.companyInfo || '',
        },
        loadingDetail: false,
      });
    } catch (err: unknown) {
      let message = 'Erro desconhecido';
      let status: number | undefined;
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
        status = err.response?.status;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({
        error: message,
        loadingDetail: false,
        credentialError: message.includes('Credenciais') || status === 403,
      });
    }
  },

  applyJob: async (jobId: string, answers: Record<string, string>) => {
    set({ loadingDetail: true, error: '' });
    try {
      await apiService.applyJob(jobId, answers);
      set((state) => {
        if (state.selectedJob && state.selectedJob.id === jobId) {
          return {
            selectedJob: {
              ...state.selectedJob,
              applied: true,
              appliedAt: new Date().toISOString(),
            },
            loadingDetail: false,
          };
        }
        return { loadingDetail: false };
      });
    } catch (err: unknown) {
      let message = 'Erro desconhecido ao candidatar';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, loadingDetail: false });
      throw new Error(message);
    }
  },

  clearSelection: () => set({ selectedJob: null, selectedJobId: null }),
  clearError: () => set({ error: '', credentialError: false }),
}));

