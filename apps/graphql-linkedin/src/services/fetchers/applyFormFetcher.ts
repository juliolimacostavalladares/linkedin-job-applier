import { getHeaders, handleResponseError } from '../http/linkedinHttpClient';
import { parseApplyForm } from '../parsers/applyFormParser';
import type { ApplyForm } from '@linkedin-job-applier/shared';
import type { LinkedInGraphQLResponse } from '../../types/linkedin';

/**
 * Fetches and parses the Easy Apply form for a given job posting.
 */
export async function fetchApplyForm(
  jobId: string,
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
): Promise<ApplyForm> {
  const apiUrl =
    `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true` +
    `&variables=(jobPostingUrn:urn%3Ali%3Afsd_jobPosting%3A${jobId})` +
    `&queryId=voyagerJobsDashOnsiteApplyApplication.96a2a30d12bccaec2b5ba9acbcbbf97c`;

  const response = await fetch(apiUrl, {
    headers: getHeaders(cookie, csrf, dynamicHeaders),
    redirect: 'manual',
  });

  handleResponseError(response);

  const jsonData = (await response.json()) as LinkedInGraphQLResponse;

  const errors = jsonData.data?.errors ?? jsonData.errors;
  if (errors && errors.length > 0) {
    return {
      success: false,
      message: errors[0]?.message ?? 'Erro retornado pelo GraphQL',
    };
  }

  return parseApplyForm(jsonData);
}
