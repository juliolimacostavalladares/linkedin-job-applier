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
    resumePdf: async (_: unknown, { profileId, cookie, csrf }: { profileId: string; cookie: string; csrf: string }) => {
      const linkedInService = new LinkedInService(cookie, csrf);
      const buffer = await linkedInService.fetchResumePdf(profileId);
      const parsedData = await pdfParse(Buffer.from(buffer));
      const pdfBase64 = Buffer.from(buffer).toString('base64');
      return {
        success: true,
        text: parsedData.text,
        pdfBase64
      };
    }
  }
};
