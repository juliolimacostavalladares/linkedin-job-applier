import { FormQuestion } from '@linkedin-job-applier/shared';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getConfig: () => api.get('/api/config'),
  
  getJobs: () => api.get('/api/jobs'),
  
  getJobDetail: (id: string) => api.get(`/api/jobs/${id}`),
  
  getApplyForm: (id: string) => api.get(`/api/jobs/${id}/apply-form`),

  applyJob: (id: string, answers: Record<string, string>) =>
    api.post(`/api/jobs/${id}/apply`, { answers }),
  
  generateAnswers: (questions: FormQuestion[], resume: string) =>
    api.post('/api/generate-answers', { questions, resume }),
  
  fetchResumeFromLinkedIn: (profileId: string) =>
    api.post('/api/resume/from-linkedin', { profileId }),
  
  getProfile: (sync?: boolean) =>
    api.get(`/api/resume/profile${sync ? '?sync=true' : ''}`),
    
  saveResumeText: (text: string) =>
    api.post('/api/resume', { text }),
};

export default api;
