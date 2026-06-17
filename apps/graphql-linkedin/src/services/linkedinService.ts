/**
 * LinkedInService – thin façade that maintains the original public API
 * while delegating every operation to the focused sub-modules.
 *
 * Resolvers import from this file only; they need no knowledge of the
 * internal module structure.
 */

import { parseDynamicHeaders } from './http/linkedinHttpClient';
import { fetchJobs, fetchJobDetail, parseJobsFromExtension } from './fetchers/jobsFetcher';
import { fetchApplyForm } from './fetchers/applyFormFetcher';
import { fetchResumePdf } from './fetchers/pdfFetcher';
import { fetchProfileInfo } from './fetchers/profileFetcher';

import type { LinkedInResponse, Job, JobDetail, ApplyForm } from '@linkedin-job-applier/shared';
import type { ProfileInfo } from './fetchers/profileFetcher';

export class LinkedInService {
  private readonly cookie: string;
  private readonly csrf: string;
  private readonly dynamicHeaders: Record<string, string>;

  constructor(cookie: string, csrf: string, headersJson?: string | null) {
    this.cookie = cookie;
    this.csrf = csrf;
    this.dynamicHeaders = parseDynamicHeaders(headersJson);
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

  fetchResumePdf(profileId: string): Promise<ArrayBuffer> {
    return fetchResumePdf(profileId, this.cookie, this.csrf);
  }

  fetchProfileInfo(): Promise<ProfileInfo> {
    return fetchProfileInfo(this.cookie, this.csrf, this.dynamicHeaders);
  }

  /**
   * Parses a LinkedInResponse received from the browser extension.
   * Kept as an instance method for API compatibility with existing callers.
   */
  parseJobsFromExtension(data: LinkedInResponse): Job[] {
    return parseJobsFromExtension(data);
  }
}
