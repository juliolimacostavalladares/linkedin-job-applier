import type { LinkedInResponse, Job } from '@linkedin-job-applier/shared';
import type { LinkedInIncludedItem, LinkedInVectorImage } from '../../types/linkedin';

/**
 * Parses a raw LinkedIn Voyager API response (from the jobs collection endpoint)
 * into an array of Job objects.
 */
export function parseJobs(data: LinkedInResponse): Job[] {
  const included = (data.included || []) as LinkedInIncludedItem[];
  const jobsMap = new Map<string, Partial<Job> & { id: string }>();

  // ── 1. Extract job titles from JobPosting items ───────────────────────────
  for (const item of included) {
    if (item.$type === 'com.linkedin.voyager.dash.jobs.JobPosting') {
      const idParts = item.entityUrn?.split(':') ?? [];
      const id = idParts[idParts.length - 1];
      if (id) {
        if (!jobsMap.has(id)) jobsMap.set(id, { id });
        const job = jobsMap.get(id);
        if (job) {
          job.title =
            typeof item.title === 'string' ? item.title : item.title?.text ?? '';
        }
      }
    }
  }

  // ── 2. Build a URN → item lookup for logo resolution ─────────────────────
  const includedMap = new Map<string, LinkedInIncludedItem>();
  for (const item of included) {
    const urn = item.entityUrn ?? item.urn;
    if (urn) includedMap.set(urn, item);
  }

  // ── 3. Extract company name and logo from JobPostingCard items ────────────
  for (const item of included) {
    if (item.$type === 'com.linkedin.voyager.dash.jobs.JobPostingCard') {
      const match = item.entityUrn?.match(/\((\d+),/);
      if (match?.[1]) {
        const id = match[1];
        if (!jobsMap.has(id)) jobsMap.set(id, { id });
        const job = jobsMap.get(id);
        if (job) {
          job.companyInfo =
            item.primaryDescription?.text ?? 'Empresa não informada';

          const vectorImage = resolveVectorImage(item, includedMap);

          if (
            vectorImage?.rootUrl &&
            vectorImage.artifacts &&
            vectorImage.artifacts.length > 0
          ) {
            const artifact =
              vectorImage.artifacts.find((a) => a.width === 100) ??
              vectorImage.artifacts[0];
            job.companyLogo =
              vectorImage.rootUrl + artifact.fileIdentifyingUrlPathSegment;
          }
        }
      }
    }
  }

  return Array.from(jobsMap.values()).filter(
    (j): j is Job =>
      typeof j.title === 'string' && typeof j.companyInfo === 'string',
  );
}

/**
 * Public alias used by the extension import flow.
 * Simply delegates to parseJobs so callers don't need to know the implementation.
 */
export function parseJobsFromExtension(data: LinkedInResponse): Job[] {
  return parseJobs(data);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveVectorImage(
  item: LinkedInIncludedItem,
  includedMap: Map<string, LinkedInIncludedItem>,
): LinkedInVectorImage | undefined {
  // Strategy 1: follow URN references inside detailData
  const detailData = item.logo?.attributes?.[0]?.detailData;
  if (detailData) {
    for (const key of Object.keys(detailData)) {
      const val = detailData[key];
      if (typeof val === 'string' && val.startsWith('urn:li:')) {
        const resolved = includedMap.get(val);
        if (resolved?.logoResolutionResult?.vectorImage) {
          return resolved.logoResolutionResult.vectorImage;
        }
        if (resolved?.vectorImage) return resolved.vectorImage;
        if (
          resolved?.profilePicture?.displayImageReferenceResolutionResult
            ?.vectorImage
        ) {
          return resolved.profilePicture.displayImageReferenceResolutionResult
            .vectorImage;
        }
      } else if (val !== null && typeof val === 'object') {
        const valObj = val as Record<string, unknown>;
        if (
          valObj['logoResolutionResult'] !== null &&
          typeof valObj['logoResolutionResult'] === 'object'
        ) {
          const lrr = valObj['logoResolutionResult'] as Record<string, unknown>;
          if (lrr['vectorImage']) {
            return lrr['vectorImage'] as LinkedInVectorImage;
          }
        } else if (valObj['vectorImage']) {
          return valObj['vectorImage'] as LinkedInVectorImage;
        }
      }
    }
  }

  // Strategy 2: follow *company URN
  if (item.companyDetails?.['*company']) {
    const company = includedMap.get(item.companyDetails['*company']);
    if (company?.logoResolutionResult?.vectorImage) {
      return company.logoResolutionResult.vectorImage;
    }
  }

  return undefined;
}
