import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { LinkedInPost } from '../types';

interface PublisherState {
  posts: LinkedInPost[];
  selectedPost: LinkedInPost | null;
  loading: boolean;
  aiGenerating: boolean;
  hasCredentials: boolean;
  profile: any | null;
  
  fetchCredentialsStatus: () => Promise<void>;
  fetchPosts: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  createPost: (post: Omit<LinkedInPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => Promise<void>;
  updatePost: (id: string, updates: Partial<LinkedInPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  setSelectedPost: (post: LinkedInPost | null) => void;
  publishPostNow: (id: string) => Promise<void>;
  schedulePost: (id: string, date: string) => Promise<void>;
  generateWithAi: (prompt: string, tone: string) => Promise<string>;
}

export const usePublisherStore = create<PublisherState>((set, get) => ({
  posts: [],
  selectedPost: null,
  loading: false,
  aiGenerating: false,
  hasCredentials: false,
  profile: null,

  fetchCredentialsStatus: async () => {
    try {
      const { data } = await apiService.getCredentialsStatus();
      set({ hasCredentials: !!data?.hasCredentials });
    } catch (error) {
      console.error('Failed to fetch credentials status:', error);
      set({ hasCredentials: false });
    }
  },

  fetchPosts: async () => {
    set({ loading: true });
    try {
      const { data } = await apiService.getPosts();
      set({ posts: data || [], loading: false });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      set({ loading: false });
    }
  },

  createPost: async (post) => {
    set({ loading: true });
    try {
      const { data } = await apiService.createPost(post);
      set((state) => ({
        posts: [data, ...state.posts],
        selectedPost: data,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to create post:', error);
      set({ loading: false });
      throw error;
    }
  },

  updatePost: async (id, updates) => {
    set({ loading: true });
    try {
      const { data } = await apiService.updatePost(id, updates);
      set((state) => {
        const updatedPosts = state.posts.map((p) => (p.id === id ? data : p));
        const nextSelected = state.selectedPost && state.selectedPost.id === id ? data : state.selectedPost;
        return {
          posts: updatedPosts,
          selectedPost: nextSelected,
          loading: false
        };
      });
    } catch (error) {
      console.error('Failed to update post:', error);
      set({ loading: false });
      throw error;
    }
  },

  deletePost: async (id) => {
    set({ loading: true });
    try {
      await apiService.deletePost(id);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        selectedPost: state.selectedPost?.id === id ? null : state.selectedPost,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to delete post:', error);
      set({ loading: false });
      throw error;
    }
  },

  setSelectedPost: (post) => set({ selectedPost: post }),

  publishPostNow: async (id) => {
    set({ loading: true });
    try {
      const { data } = await apiService.publishPost(id);
      set((state) => {
        const updatedPosts = state.posts.map((p) => (p.id === id ? data : p));
        const nextSelected = state.selectedPost && state.selectedPost.id === id ? data : state.selectedPost;
        return {
          posts: updatedPosts,
          selectedPost: nextSelected,
          loading: false
        };
      });
    } catch (error) {
      console.error('Failed to publish post immediately:', error);
      set({ loading: false });
      throw error;
    }
  },

  schedulePost: async (id, date) => {
    await get().updatePost(id, {
      status: 'scheduled',
      scheduledAt: date,
      publishedAt: undefined
    });
  },

  generateWithAi: async (prompt, tone) => {
    set({ aiGenerating: true });
    try {
      const { data } = await apiService.generatePost(prompt, tone);
      set({ aiGenerating: false });
      return data.text || '';
    } catch (error) {
      set({ aiGenerating: false });
      console.error('AI generation failed:', error);
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await apiService.getProfile();
      set({ profile: data });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      set({ profile: null });
    }
  }
}));
