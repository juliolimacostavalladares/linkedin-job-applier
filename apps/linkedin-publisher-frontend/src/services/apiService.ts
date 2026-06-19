import axios from 'axios';
import type { LinkedInPost } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Credentials
  getCredentialsStatus: () =>
    api.get<{ hasCredentials: boolean }>('/api/credentials/status'),

  // Posts
  getPosts: () =>
    api.get<LinkedInPost[]>('/api/posts'),

  createPost: (post: Omit<LinkedInPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) =>
    api.post<LinkedInPost>('/api/posts', post),

  updatePost: (id: string, updates: Partial<LinkedInPost>) =>
    api.put<LinkedInPost>(`/api/posts/${id}`, updates),

  deletePost: (id: string) =>
    api.delete(`/api/posts/${id}`),

  publishPost: (id: string) =>
    api.post<LinkedInPost>(`/api/posts/${id}/publish`),

  // AI
  generatePost: (prompt: string, tone: string) =>
    api.post<{ text: string }>('/api/ai/generate-post', { prompt, tone }),

  // Profile
  getProfile: () =>
    api.get('/api/profile'),
};

export default api;
