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

  createPost: (post: Omit<LinkedInPost, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>, images?: File[]) => {
    // Se houver imagens, enviar FormData; senão, enviar JSON normal
    if (images && images.length > 0) {
      const formData = new FormData();
      formData.append('text', post.text);
      formData.append('type', post.type);
      formData.append('status', post.status);
      if (post.scheduledAt) {
        formData.append('scheduledAt', post.scheduledAt);
      }
      if (post.mediaUrl) {
        formData.append('mediaUrl', post.mediaUrl);
      }
      if (post.mediaName) {
        formData.append('mediaName', post.mediaName);
      }
      images.forEach((file) => {
        formData.append('images', file);
      });
      return api.post<LinkedInPost>('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post<LinkedInPost>('/api/posts', post);
  },

  updatePost: (id: string, updates: Partial<LinkedInPost>) =>
    api.put<LinkedInPost>(`/api/posts/${id}`, updates),

  deletePost: (id: string) =>
    api.delete(`/api/posts/${id}`),

  publishPost: (id: string, mediaUrn?: string) =>
    api.post<LinkedInPost>(`/api/posts/${id}/publish`, { mediaUrn }),

  // Image Upload
  uploadImages: (images: File[]) => {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file);
    });
    return api.post<{ success: boolean; mediaUrn?: string; imageCount?: number; error?: string }>(
      '/api/posts/upload-images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // AI
  generatePost: (prompt: string, tone: string) =>
    api.post<{ text: string }>('/api/ai/generate-post', { prompt, tone }),

  generateCarousel: (prompt: string, tone: string) =>
    api.post<{ title: string; slides: any[] }>('/api/ai/generate-carousel', { prompt, tone }),

  // Carousel PDF
  exportCarouselPdf: (config: { theme: string; title: string; authorName: string; slides: any[] }) =>
    api.post('/api/carousel/generate-pdf', config, { responseType: 'blob' }),

  // Profile
  getProfile: () =>
    api.get('/api/profile'),
};

export default api;
