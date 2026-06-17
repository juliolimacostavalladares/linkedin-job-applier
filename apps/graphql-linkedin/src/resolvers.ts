import { LinkedInService } from './services/linkedinService';
import pdfParse from 'pdf-parse';

export const resolvers = {
  Query: {
    jobs: async (
      _: unknown,
      {
        cookie,
        csrf,
        headersJson,
        keywords,
        remote,
        past24h,
      }: {
        cookie: string;
        csrf: string;
        headersJson?: string | null;
        keywords?: string | null;
        remote?: boolean | null;
        past24h?: boolean | null;
      }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      return svc.fetchJobs(keywords, remote, past24h);
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
  Mutation: {
    submitApplication: async (
      _: unknown,
      {
        id,
        formValues,
        cookie,
        csrf,
        headersJson,
        formResponsesJson,
        referenceId,
        fileUploadResponsesJson,
        resumeUrn,
        resumeUploadFormElementUrn,
      }: {
        id: string;
        formValues: string;
        cookie: string;
        csrf: string;
        headersJson?: string | null;
        formResponsesJson?: string | null;
        referenceId?: string | null;
        fileUploadResponsesJson?: string | null;
        resumeUrn?: string | null;
        resumeUploadFormElementUrn?: string | null;
      }
    ) => {
      const svc = new LinkedInService(cookie, csrf, headersJson);
      const parsedValues = JSON.parse(formValues) as Record<string, string>;

      const formResponses = formResponsesJson
        ? (JSON.parse(formResponsesJson) as import('@linkedin-job-applier/shared').FormResponse[])
        : undefined;

      // Build fileUploadResponses: prefer explicit JSON, else auto-build from resumeUrn shortcut
      let fileUploadResponses: import('@linkedin-job-applier/shared').FileUploadResponse[] | undefined;
      if (fileUploadResponsesJson) {
        fileUploadResponses = JSON.parse(fileUploadResponsesJson) as import('@linkedin-job-applier/shared').FileUploadResponse[];
      } else if (resumeUrn && resumeUploadFormElementUrn) {
        fileUploadResponses = [{
          inputUrn: resumeUrn,
          formElementUrn: resumeUploadFormElementUrn,
        }];
      }

      return svc.submitApplyForm(id, parsedValues, {
        formResponses,
        referenceId: referenceId ?? undefined,
        fileUploadResponses,
      });
    },
  },
};

