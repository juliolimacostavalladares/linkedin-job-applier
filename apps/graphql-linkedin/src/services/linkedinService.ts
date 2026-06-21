import { validateCredentials, validateHeadersJson } from '../utils/security';
import { fetchJobs, fetchJobDetail, parseJobsFromExtension } from './fetchers/jobsFetcher';
import { fetchApplyForm } from './fetchers/applyFormFetcher';
import { submitApplyForm, type ApplySubmissionResult } from './fetchers/submitApplyFormFetcher';
import { fetchResumePdf } from './fetchers/pdfFetcher';
import { fetchProfileInfo } from './fetchers/profileFetcher';
import { createPost, deletePost, type CreatePostResult, type DeletePostResult } from './fetchers/postPublisher';

import type { LinkedInResponse, Job, JobDetail, ApplyForm } from '@linkedin-job-applier/shared';
import type { ProfileInfo } from './fetchers/profileFetcher';

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
      documentSharingTitle
    );
  }

  deletePost(linkedinId: string): Promise<DeletePostResult> {
    return deletePost(this.cookie, this.csrf, this.dynamicHeaders, linkedinId);
  }

  fetchJobs(keywords?: string | null, remote?: boolean | null, past24h?: boolean | null): Promise<Job[]> {
    return fetchJobs(this.cookie, this.csrf, this.dynamicHeaders, keywords, remote, past24h);
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
      formResponses?: import('@linkedin-job-applier/shared').FormResponse[];
      referenceId?: string;
      fileUploadResponses?: import('@linkedin-job-applier/shared').FileUploadResponse[];
    },
  ): Promise<ApplySubmissionResult> {
    return submitApplyForm(jobId, formValues, this.cookie, this.csrf, this.dynamicHeaders, options);
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

