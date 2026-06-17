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
  
  getJobs: (q?: string, remote?: boolean, past24h?: boolean) => {
    const params = new URLSearchParams();
    if (q && q.trim()) params.append('q', q.trim());
    if (remote !== undefined) params.append('remote', String(remote));
    if (past24h !== undefined) params.append('past24h', String(past24h));
    const queryStr = params.toString();
    return api.get(`/api/jobs${queryStr ? `?${queryStr}` : ''}`);
  },
  
  getJobDetail: (id: string) => api.get(`/api/jobs/${id}`),
  
  getApplyForm: (id: string) => api.get(`/api/jobs/${id}/apply-form`),

  applyJob: (
    id: string, 
    answers: Record<string, string>, 
    metadata?: { jobTitle?: string; companyName?: string; companyLogo?: string; jobUrl?: string; optimizedResume?: string }
  ) =>
    api.post(`/api/jobs/${id}/apply`, { answers, ...metadata }),
  
  generateAnswers: (questions: FormQuestion[], resume: string) =>
    api.post('/api/generate-answers', { questions, resume }),
  
  fetchResumeFromLinkedIn: (profileId: string) =>
    api.post('/api/resume/from-linkedin', { profileId }),
  
  getProfile: (sync?: boolean) =>
    api.get(`/api/resume/profile${sync ? '?sync=true' : ''}`),
    
  saveResumeText: (text: string) =>
    api.post('/api/resume', { text }),

  getApplications: () => api.get('/api/applications'),
  
  syncApplications: () => api.post('/api/applications/sync'),
};

export default api;
