import { logger } from '../../utils/logger';
import { writeFileSync } from 'fs';
import { getHeaders, handleResponseError } from '../http/linkedinHttpClient';
import { parseJobs, parseJobsFromExtension } from '../parsers/jobsParser';
import type { LinkedInResponse, Job, JobDetail } from '@linkedin-job-applier/shared';
import type { LinkedInJobDetailRaw } from '../../types/linkedin';

/**
 * Fetches the Easy-Apply job listing from the LinkedIn Voyager API.
 * Only jobs with a footerItem of type EASY_APPLY_TEXT are returned (see jobsParser.ts).
 */
export async function fetchJobs(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
): Promise<Job[]> {
  const apiUrl =
    'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(count:24,jobCollectionSlug:easy-apply,query:(origin:GENERIC_JOB_COLLECTIONS_LANDING),start:0)&queryId=voyagerJobsDashJobCards.e5b6b761ede078dabe8ad857aa42c220';

  logger.debug('Fetching jobs from LinkedIn API');

  const response = await fetch(apiUrl, {
    headers: getHeaders(cookie, csrf, dynamicHeaders),
    redirect: 'manual',
  });

  handleResponseError(response);

  const data = (await response.json()) as LinkedInResponse;
  // Save full raw response for offline inspection
  try { writeFileSync('/tmp/linkedin-jobs-raw.json', JSON.stringify(data, null, 2)); } catch { /* ignore */ }
  const jobs = parseJobs(data);

  logger.info('Fetched jobs from LinkedIn', { count: jobs.length });

  return jobs;
}

/**
 * Fetches the detail page for a single job posting.
 */
export async function fetchJobDetail(
  jobId: string,
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
): Promise<JobDetail> {
  const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}`;

  logger.debug('Fetching job detail', { jobId });

  const response = await fetch(apiUrl, {
    headers: getHeaders(cookie, csrf, dynamicHeaders),
    redirect: 'manual',
  });

  handleResponseError(response);

  const jsonData = (await response.json()) as { data?: LinkedInJobDetailRaw } & LinkedInJobDetailRaw;
  const data = jsonData.data ?? (jsonData as LinkedInJobDetailRaw);

  const vectorImage = data.companyDetails?.logoResolutionResult?.vectorImage;
  let companyLogo: string | undefined;

  if (vectorImage?.rootUrl && vectorImage.artifacts?.length) {
    const artifact =
      vectorImage.artifacts.find((x) => x.width === 100) ??
      vectorImage.artifacts[0];
    companyLogo = vectorImage.rootUrl + artifact.fileIdentifyingUrlPathSegment;
  }

  const jobDetail: JobDetail = {
    id: jobId,
    title: data.title ?? 'Vaga desconhecida',
    description: data.description?.text ?? '<em>Sem descrição detalhada.</em>',
    location: data.formattedLocation ?? '',
    url:
      data.jobPostingUrl ??
      `https://www.linkedin.com/jobs/view/${jobId}`,
    employmentStatus: data.employmentStatus?.split(':').pop() ?? 'FULL_TIME',
    companyName: data.companyDetails?.company?.split(':').pop() ?? '',
    companyLogo,
  };

  logger.info('Fetched job detail', { jobId, title: jobDetail.title });

  return jobDetail;
}

// Re-export the extension helper so the facade can delegate cleanly
export { parseJobsFromExtension };
