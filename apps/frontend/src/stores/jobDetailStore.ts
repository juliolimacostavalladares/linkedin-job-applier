import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { JobDetail, ApplyForm } from '../types';

interface JobDetailState {
  selectedJob: JobDetail | null;
  applyForm: ApplyForm | null;
  loadingDetail: boolean;
  fetchJobDetail: (jobId: string, companyInfo: string, companyLogo?: string) => Promise<void>;
  clearSelection: () => void;
}

export const useJobDetailStore = create<JobDetailState>((set) => ({
  selectedJob: null,
  applyForm: null,
  loadingDetail: false,
  fetchJobDetail: async (jobId, companyInfo, companyLogo) => {
    set({ loadingDetail: true, selectedJob: null, applyForm: null });
    try {
      const [detailRes, formRes] = await Promise.all([
        apiService.getJobDetail(jobId),
        apiService.getApplyForm(jobId),
      ]);
      
      set({
        selectedJob: { ...detailRes.data, companyName: companyInfo, companyLogo },
        applyForm: formRes.data,
        loadingDetail: false,
      });
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Erro desconhecido');
      set({ loadingDetail: false });
    }
  },
  clearSelection: () => set({ selectedJob: null, applyForm: null }),
}));
