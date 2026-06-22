import type { LinkedInResponse, Job } from '@linkedin-job-applier/shared';
import type { LinkedInIncludedItem, LinkedInVectorImage, LinkedInFooterItem } from '../../types/linkedin';

/**
 * Parses a raw LinkedIn Voyager API response (from the jobs collection endpoint)
 * into an array of Job objects.
 */
export function parseJobs(data: LinkedInResponse): Job[] {
  const included = (data.included || []) as LinkedInIncludedItem[];
  // isEasyApply is determined from JobPostingCard.footerItems (type EASY_APPLY_TEXT)
  const jobsMap = new Map<string, Partial<Job> & { id: string; isEasyApply?: boolean }>();

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
          // isEasyApply will be set in step 3 from JobPostingCard.footerItems
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

  // ── 3. Extract company name, logo AND Easy Apply flag from JobPostingCard items ──
  for (const item of included) {
    if (item.$type === 'com.linkedin.voyager.dash.jobs.JobPostingCard') {
      const match = item.entityUrn?.match(/\((\d+),/);
      if (match?.[1]) {
        const id = match[1];
        if (!jobsMap.has(id)) jobsMap.set(id, { id });
        const job = jobsMap.get(id);
        if (job) {
          const compName = item.primaryDescription?.text;
          if (compName) {
            job.companyInfo = compName;
          } else if (!job.companyInfo) {
            job.companyInfo = 'Empresa não informada';
          }

          // ── Easy Apply detection via footerItems ─────────────────────────
          // The listing endpoint never returns applyMethod on JobPosting.
          // Instead, JobPostingCard.footerItems contains an entry with
          // type === 'EASY_APPLY_TEXT' when the job supports Easy Apply.
          // NOTE: each job id appears TWICE in included — one card has footerItems,
          // the other has none. Use ||= so a true value is never overwritten.
          const footerItems = (item.footerItems ?? []) as LinkedInFooterItem[];
          job.isEasyApply ||= footerItems.some((f) => f.type === 'EASY_APPLY_TEXT');

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

  // ── 4. Extract applied status from JobSeekerJobState items ──────────────
  const appliedJobsSet = new Set<string>();
  for (const item of included) {
    if (item.$type === 'com.linkedin.voyager.dash.jobs.JobSeekerJobState') {
      const jobId = item.entityUrn?.split(':').pop();
      if (jobId) {
        const actions = item.jobSeekerJobStateActions || [];
        const hasApplied = actions.some((action) => action.jobSeekerJobStateEnums === 'APPLIED');
        if (hasApplied) {
          appliedJobsSet.add(jobId);
        }
      }
    }
  }

  return Array.from(jobsMap.values())
    .filter(
      (j): j is Partial<Job> & { id: string; title: string; companyInfo: string; isEasyApply: boolean } =>
        typeof j.title === 'string' &&
        typeof j.companyInfo === 'string' &&
        j.isEasyApply === true,
    )
    .map((j) => {
      const job: Job = {
        id: j.id,
        title: j.title,
        companyInfo: j.companyInfo,
        companyLogo: j.companyLogo,
        applied: appliedJobsSet.has(j.id),
      };
      return job;
    });
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
        if (resolved?.logo?.vectorImage) return resolved.logo.vectorImage;
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
        } else if (
          valObj['logo'] !== null &&
          typeof valObj['logo'] === 'object' &&
          (valObj['logo'] as Record<string, unknown>)['vectorImage']
        ) {
          return (valObj['logo'] as Record<string, unknown>)['vectorImage'] as LinkedInVectorImage;
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
    if (company?.logo?.vectorImage) {
      return company.logo.vectorImage;
    }
  }

  return undefined;
}
