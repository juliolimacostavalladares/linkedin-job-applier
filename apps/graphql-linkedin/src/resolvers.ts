import { LinkedInService } from './services/linkedinService';
import pdfParse from 'pdf-parse';

export const resolvers = {
  Query: {
    jobs: async (_: unknown, { cookie, csrf, headersJson }: { cookie: string; csrf: string; headersJson?: string | null }) => {
      const linkedInService = new LinkedInService(cookie, csrf, headersJson);
      return linkedInService.fetchJobs();
    },
    jobDetail: async (_: unknown, { id, cookie, csrf, headersJson }: { id: string; cookie: string; csrf: string; headersJson?: string | null }) => {
      const linkedInService = new LinkedInService(cookie, csrf, headersJson);
      return linkedInService.fetchJobDetail(id);
    },
    applyForm: async (_: unknown, { id, cookie, csrf, headersJson }: { id: string; cookie: string; csrf: string; headersJson?: string | null }) => {
      const linkedInService = new LinkedInService(cookie, csrf, headersJson);
      return linkedInService.fetchApplyForm(id);
    },
    resumePdf: async () => {
      return {
        success: true,
        text: 'O currículo em PDF foi substituído pelo sincronismo direto de perfil do LinkedIn.',
        pdfBase64: ''
      };
    },
    profileInfo: async (_: unknown, { cookie, csrf, headersJson }: { cookie: string; csrf: string; headersJson?: string | null }) => {
      const linkedInService = new LinkedInService(cookie, csrf, headersJson);
      return linkedInService.fetchProfileInfo();
    }
  }
};
