import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { Config } from '../types';

interface AuthState {
  config: Config | null;
  loading: boolean;
  fetchConfig: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  config: null,
  loading: true,
  fetchConfig: async () => {
    try {
      const { data } = await apiService.getConfig();
      set({ config: data, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
}));
