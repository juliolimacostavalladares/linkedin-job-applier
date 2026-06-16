import { LinkedInService } from './services/linkedinService';
import pdfParse from 'pdf-parse';

export const resolvers = {
  Query: {
    jobs: async (
      _: unknown,
      { cookie, csrf, headersJson }: { cookie: string; csrf: string; headersJson?: string | null }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      return svc.fetchJobs();
    },

    jobDetail: async (
      _: unknown,
      { id, cookie, csrf, headersJson }: { id: string; cookie: string; csrf: string; headersJson?: string | null }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      return svc.fetchJobDetail(id);
    },

    applyForm: async (
      _: unknown,
      { id, cookie, csrf, headersJson }: { id: string; cookie: string; csrf: string; headersJson?: string | null }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      return svc.fetchApplyForm(id);
    },

    /**
     * Downloads the LinkedIn profile PDF, parses its text with pdf-parse,
     * and returns both the raw text and a base64-encoded copy for preview.
     */
    resumePdf: async (
      _: unknown,
      {
        profileId,
        cookie,
        csrf,
        headersJson,
      }: { profileId: string; cookie: string; csrf: string; headersJson?: string | null }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      const buffer = await svc.fetchResumePdf(profileId);
      const nodeBuffer = Buffer.from(buffer);
      const parsed = await pdfParse(nodeBuffer);
      return {
        success: true,
        text: parsed.text,
        pdfBase64: nodeBuffer.toString('base64'),
      };
    },

    /**
     * Fetches the minimal LinkedIn identity (/voyager/api/me).
     * Detailed parsing (about, experiences, education) is done on the backend
     * via the AI service after downloading the PDF.
     */
    profileInfo: async (
      _: unknown,
      { cookie, csrf, headersJson }: { cookie: string; csrf: string; headersJson?: string | null }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      return svc.fetchProfileInfo();
    },
  },
};
