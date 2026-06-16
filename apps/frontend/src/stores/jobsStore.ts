import { create } from 'zustand';
import axios from 'axios';
import { apiService } from '../services/apiService';
import type { Job, JobDetail } from '../types';

interface JobsState {
  jobs: Job[];
  selectedJob: JobDetail | null;
  selectedJobId: string | null;
  loading: boolean;
  error: string;
  credentialError: boolean;
  fetchJobs: () => Promise<void>;
  selectJob: (job: Job) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  selectedJob: null,
  selectedJobId: null,
  loading: false,
  error: '',
  credentialError: false,

  fetchJobs: async () => {
    set({ loading: true, error: '', credentialError: false });
    try {
      const { data } = await apiService.getJobs();
      set({ jobs: data.jobs || [], loading: false });
    } catch (err: unknown) {
      let message = 'Erro desconhecido';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ 
        error: message,
        loading: false,
        credentialError: message.includes('Credenciais'),
      });
    }
  },

  selectJob: async (job: Job) => {
    set({ selectedJobId: job.id, loading: true, error: '', credentialError: false });
    try {
      const { data } = await apiService.getJobDetail(job.id);
      // Mescla com os dados da listagem (logo e companyInfo vêm de lá)
      set({
        selectedJob: {
          ...data,
          companyLogo: data.companyLogo || job.companyLogo || undefined,
          companyName: data.companyName || data.companyInfo || job.companyInfo || '',
        },
        loading: false,
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
        loading: false,
        credentialError: message.includes('Credenciais') || status === 403,
      });
    }
  },

  clearSelection: () => set({ selectedJob: null, selectedJobId: null }),
  clearError: () => set({ error: '', credentialError: false }),
}));
