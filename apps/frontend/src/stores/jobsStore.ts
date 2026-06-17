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
  searchQuery: string;
  remoteFilter: boolean;
  past24hFilter: boolean;
  fetchJobs: (q?: string, remote?: boolean, past24h?: boolean) => Promise<void>;
  setFilters: (filters: { q?: string; remote?: boolean; past24h?: boolean }) => void;
  selectJob: (job: Job) => Promise<void>;
  applyJob: (
    jobId: string, 
    answers: Record<string, string>,
    metadata?: { jobTitle?: string; companyName?: string; companyLogo?: string; jobUrl?: string; optimizedResume?: string }
  ) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  selectedJob: null,
  selectedJobId: null,
  loadingList: false,
  loadingDetail: false,
  loading: false,
  error: '',
  credentialError: false,
  searchQuery: '',
  remoteFilter: true,
  past24hFilter: true,

  setFilters: (filters) => {
    set((state) => ({
      searchQuery: filters.q !== undefined ? filters.q : state.searchQuery,
      remoteFilter: filters.remote !== undefined ? filters.remote : state.remoteFilter,
      past24hFilter: filters.past24h !== undefined ? filters.past24h : state.past24hFilter,
    }));
  },

  fetchJobs: async (q?: string, remote?: boolean, past24h?: boolean) => {
    const query = q !== undefined ? q : get().searchQuery;
    const isRemote = remote !== undefined ? remote : get().remoteFilter;
    const isPast24h = past24h !== undefined ? past24h : get().past24hFilter;

    set({ loadingList: true, loading: true, error: '', credentialError: false });
    try {
      const { data } = await apiService.getJobs(query, isRemote, isPast24h);
      set({ 
        jobs: data.jobs || [], 
        searchQuery: data.searchQuery !== undefined ? data.searchQuery : query,
        remoteFilter: data.filters?.remote !== undefined ? data.filters.remote : isRemote,
        past24hFilter: data.filters?.past24h !== undefined ? data.filters.past24h : isPast24h,
        loadingList: false, 
        loading: false 
      });
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

  applyJob: async (
    jobId: string, 
    answers: Record<string, string>,
    metadata?: { jobTitle?: string; companyName?: string; companyLogo?: string; jobUrl?: string; optimizedResume?: string }
  ) => {
    set({ loadingDetail: true, error: '' });
    try {
      await apiService.applyJob(jobId, answers, metadata);
      set((state) => {
        const updatedJobs = state.jobs.map((j) => {
          if (j.id === jobId) {
            return { ...j, applied: true };
          }
          return j;
        });

        if (state.selectedJob && state.selectedJob.id === jobId) {
          return {
            jobs: updatedJobs,
            selectedJob: {
              ...state.selectedJob,
              applied: true,
              appliedAt: new Date().toISOString(),
            },
            loadingDetail: false,
          };
        }
        return { jobs: updatedJobs, loadingDetail: false };
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

