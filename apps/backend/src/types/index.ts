export * from '@linkedin-job-applier/shared';

export interface ApiConfig {
  hasCredentials: boolean;
  hasImportedJobs: boolean;
}

export interface LinkedInResponse {
  included?: unknown[];
  [key: string]: unknown;
}
