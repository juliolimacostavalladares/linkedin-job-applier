import { create } from 'zustand';
import axios from 'axios';
import { apiService } from '../services/apiService';
import type { Application } from '../types';

interface ApplicationsState {
  applications: Application[];
  loading: boolean;
  syncing: boolean;
  error: string;
  fetchApplications: () => Promise<void>;
  syncWithLinkedIn: () => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: [],
  loading: false,
  syncing: false,
  error: '',

  fetchApplications: async () => {
    set({ loading: true, error: '' });
    try {
      const { data } = await apiService.getApplications();
      set({ applications: data || [], loading: false });
    } catch (err: unknown) {
      let message = 'Erro ao buscar candidaturas';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, loading: false });
    }
  },

  syncWithLinkedIn: async () => {
    set({ syncing: true, error: '' });
    try {
      const { data } = await apiService.syncApplications();
      
      // Recarregar lista após sincronização
      set({ syncing: false });
      await new Promise(resolve => setTimeout(resolve, 100));
      await useApplicationsStore.getState().fetchApplications();
      
      return {
        success: true,
        message: data.message || 'Sincronização concluída'
      };
    } catch (err: unknown) {
      let message = 'Erro ao sincronizar com LinkedIn';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message, syncing: false });
      return { success: false, message };
    }
  },

  clearError: () => set({ error: '' }),
}));
