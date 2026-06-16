import { LinkedInService } from './services/linkedinService';
import pdfParse from 'pdf-parse';

export const resolvers = {
  Query: {
    jobs: async (_: unknown, { cookie, csrf }: { cookie: string; csrf: string }) => {
      const linkedInService = new LinkedInService(cookie, csrf);
      return linkedInService.fetchJobs();
    },
    jobDetail: async (_: unknown, { id, cookie, csrf }: { id: string; cookie: string; csrf: string }) => {
      const linkedInService = new LinkedInService(cookie, csrf);
      return linkedInService.fetchJobDetail(id);
    },
    applyForm: async (_: unknown, { id, cookie, csrf }: { id: string; cookie: string; csrf: string }) => {
      const linkedInService = new LinkedInService(cookie, csrf);
      return linkedInService.fetchApplyForm(id);
    },
    resumePdf: async () => {
      return {
        success: true,
        text: 'O currículo em PDF foi substituído pelo sincronismo direto de perfil do LinkedIn.',
        pdfBase64: ''
      };
    },
    profileInfo: async (_: unknown, { cookie, csrf }: { cookie: string; csrf: string }) => {
      const linkedInService = new LinkedInService(cookie, csrf);
      return linkedInService.fetchProfileInfo();
    }
  }
};
