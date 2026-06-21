import { validateCredentials, validateHeadersJson } from "../utils/security";
import {
  fetchJobs,
  fetchJobDetail,
  parseJobsFromExtension,
} from "./jobs/jobsFetcher";
import { fetchApplyForm } from "./jobs/applyFormFetcher";
import {
  submitApplyForm,
  type ApplySubmissionResult,
} from "./jobs/submitApplyFormFetcher";
import { fetchResumePdf } from "./profile/pdfFetcher";
import { fetchProfileInfo } from "./profile/profileFetcher";
import {
  createPost,
  deletePost,
  type CreatePostResult,
  type DeletePostResult,
} from "./posts/postPublisher";

import type {
  LinkedInResponse,
  Job,
  JobDetail,
  ApplyForm,
  FormResponse,
  FileUploadResponse,
} from "@linkedin-job-applier/shared";
import type { ProfileInfo } from "./profile/profileFetcher";

export class LinkedInService {
  private readonly cookie: string;
  private readonly csrf: string;
  private readonly dynamicHeaders: Record<string, string>;

  constructor(cookie: string, csrf: string, headersJson?: string | null) {
    validateCredentials(cookie, csrf);
    this.cookie = cookie;
    this.csrf = csrf;
    this.dynamicHeaders = validateHeadersJson(headersJson);
  }

  createPost(
    text: string,
    mediaUrn?: string,
    mediaCategory?: string,
    documentSharingTitle?: string,
  ): Promise<CreatePostResult> {
    return createPost(
      this.cookie,
      this.csrf,
      this.dynamicHeaders,
      text,
      mediaUrn,
      mediaCategory,
      documentSharingTitle,
    );
  }

  deletePost(linkedinId: string): Promise<DeletePostResult> {
    return deletePost(this.cookie, this.csrf, this.dynamicHeaders, linkedinId);
  }

  fetchJobs(
    keywords?: string | null,
    remote?: boolean | null,
    past24h?: boolean | null,
  ): Promise<Job[]> {
    return fetchJobs(
      this.cookie,
      this.csrf,
      this.dynamicHeaders,
      keywords,
      remote,
      past24h,
    );
  }

  fetchJobDetail(jobId: string): Promise<JobDetail> {
    return fetchJobDetail(jobId, this.cookie, this.csrf, this.dynamicHeaders);
  }

  fetchApplyForm(jobId: string): Promise<ApplyForm> {
    return fetchApplyForm(jobId, this.cookie, this.csrf, this.dynamicHeaders);
  }

  submitApplyForm(
    jobId: string,
    formValues: Record<string, string>,
    options?: {
      formResponses?: FormResponse[];
      referenceId?: string;
      fileUploadResponses?: FileUploadResponse[];
    },
  ): Promise<ApplySubmissionResult> {
    return submitApplyForm(
      jobId,
      formValues,
      this.cookie,
      this.csrf,
      this.dynamicHeaders,
      options,
    );
  }

  fetchResumePdf(profileId: string): Promise<ArrayBuffer> {
    return fetchResumePdf(profileId, this.cookie, this.csrf);
  }

  fetchProfileInfo(): Promise<ProfileInfo> {
    return fetchProfileInfo(this.cookie, this.csrf, this.dynamicHeaders);
  }

  parseJobsFromExtension(data: LinkedInResponse): Job[] {
    return parseJobsFromExtension(data);
  }
}
