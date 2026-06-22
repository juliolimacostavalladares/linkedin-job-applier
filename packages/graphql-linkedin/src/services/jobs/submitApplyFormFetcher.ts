import { getHeaders } from '../http/linkedinHttpClient';
import { writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { fetchApplyForm } from './applyFormFetcher';
import type {
  FormResponse,
  FileUploadResponse,
} from '@linkedin-job-applier/shared';

export interface ApplySubmissionResult {
  success: boolean;
  message?: string;
}

interface SubmitPayload {
  followCompany: boolean;
  responses: FormResponse[];
  referenceId: string;
  fileUploadResponses?: FileUploadResponse[];
  trackingId: string;
  trackingCode?: string;
}

/**
 * Generates a random tracking ID in latin1 format (16 bytes).
 * LinkedIn sends an opaque binary trackingId captured at form-load time,
 * but a freshly-generated one is accepted by the API.
 */
function generateTrackingId(): string {
  return randomBytes(16).toString('latin1');
}

/**
 * Converts a flat answers map (Record<formElementUrn, answerString>) into
 * LinkedIn's typed FormResponse[] wire format.
 *
 * The URN suffix encodes the field type, e.g.:
 *   - (jobId,elementId,text)           → textInputValue
 *   - (jobId,elementId,numeric)        → textInputValue  (numbers as strings)
 *   - (jobId,elementId,multipleChoice) → entityInputValue
 *   - (jobId,elementId,location~…)     → entityInputValue
 *   - (jobId,elementId,phoneNumber~…)  → entityInputValue (country) | textInputValue (number)
 *   - (jobId,elementId,dateRange~…)    → dateRangeInputValue
 */
export function convertFlatAnswersToResponses(
  formValues: Record<string, string>,
): FormResponse[] {
  const responses: FormResponse[] = [];

  for (const [formElementUrn, value] of Object.entries(formValues)) {
    if (value === undefined || value === null || String(value).trim() === '') continue;

    const isFileUpload = formElementUrn.includes('FileUploadFormElement') || formElementUrn.startsWith('urn:li:fsu_');
    if (isFileUpload) continue;

    const isDateRange = formElementUrn.includes('dateRange~');
    const isEntityField =
      formElementUrn.includes('multipleChoice') ||
      formElementUrn.includes('phoneNumber~country') ||
      formElementUrn.includes('location~');

    if (isDateRange) {
      // dateRange values must be pre-serialised as JSON by the caller.
      // Format: '{"start":{"year":2022,"month":1,"day":1},"end":{"year":2023,"month":6,"day":1}}'
      try {
        const parsed = JSON.parse(value) as {
          start: { year: number; month: number; day?: number };
          end?: { year: number; month: number; day?: number };
        };
        const dateRangeInputValue = {
          $type: 'com.linkedin.common.DateRange',
          start: {
            $type: 'com.linkedin.common.Date',
            year: parsed.start.year,
            month: parsed.start.month,
            ...(parsed.start.day !== undefined ? { day: parsed.start.day } : {}),
          },
          ...(parsed.end ? {
            end: {
              $type: 'com.linkedin.common.Date',
              year: parsed.end.year,
              month: parsed.end.month,
              ...(parsed.end.day !== undefined ? { day: parsed.end.day } : {}),
            }
          } : {}),
        };
        responses.push({
          formElementUrn,
          formElementInputValues: [
            { dateRangeInputValue: dateRangeInputValue as unknown as import('@linkedin-job-applier/shared').DateRangeInputValue }
          ],
        });
      } catch {
        // If it can't be parsed, skip rather than send malformed data
      }
    } else if (isEntityField) {
      // Value encoding:
      //   "Label|urn:li:..."  → entityInputValue with inputEntityUrn  (country/location fields)
      //   "Label||enumString" → entityInputValue with optionEnumString (multipleChoice enum fields)
      //   "Label"             → entityInputValue with name only
      const doublePipeIdx = value.indexOf('||');
      const pipeIdx = doublePipeIdx === -1 ? value.indexOf('|') : -1;

      if (doublePipeIdx !== -1) {
        // Enum-based multipleChoice (e.g. Yes/No)
        responses.push({
          formElementUrn,
          formElementInputValues: [
            {
              entityInputValue: {
                inputEntityName: value.slice(0, doublePipeIdx),
                optionEnumString: value.slice(doublePipeIdx + 2),
              },
            },
          ],
        });
      } else if (pipeIdx !== -1) {
        // URN-based entity (country, location)
        responses.push({
          formElementUrn,
          formElementInputValues: [
            {
              entityInputValue: {
                inputEntityName: value.slice(0, pipeIdx),
                inputEntityUrn: value.slice(pipeIdx + 1),
              },
            },
          ],
        });
      } else {
        responses.push({
          formElementUrn,
          formElementInputValues: [
            { entityInputValue: { inputEntityName: value } },
          ],
        });
      }
    } else {
      // text / multiline-text / numeric (LinkedIn accepts numbers inside textInputValue)
      responses.push({
        formElementUrn,
        formElementInputValues: [{ textInputValue: value }],
      });
    }
  }

  return responses;
}

/**
 * Submits the Easy Apply form to LinkedIn via the Voyager REST API.
 *
 * Accepts either:
 *   a) Pre-built FormResponse[] (preferred — from a typed frontend payload)
 *   b) Flat Record<string,string> answers (legacy / AI-generated answers)
 *
 * @param jobId           LinkedIn job posting ID (used only for logging)
 * @param formResponses   Pre-typed responses array (takes priority over flatAnswers)
 * @param flatAnswers     Fallback flat answers map
 * @param cookie          LinkedIn session cookie
 * @param csrf            LinkedIn CSRF token
 * @param dynamicHeaders  Additional headers from the extension
 * @param referenceId     Captured from GET apply-form (forwarded verbatim)
 * @param fileUploadResponses  Pre-built file upload entries (resume URN etc.)
 */
export async function submitApplyForm(
  jobId: string,
  flatAnswers: Record<string, string>,
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  options?: {
    formResponses?: FormResponse[];
    referenceId?: string;
    trackingId?: string;
    fileUploadResponses?: FileUploadResponse[];
  },
): Promise<ApplySubmissionResult> {
  const apiUrl =
    `https://www.linkedin.com/voyager/api/voyagerJobsDashOnsiteApplyApplication?action=submitApplication`;

  // ── Auto-map answers options to optionUrns / optionEnumStrings if possible ──
  let enrichedAnswers = { ...flatAnswers };
  let fetchedForm: any = undefined;
  try {
    const form = await fetchApplyForm(jobId, cookie, csrf, dynamicHeaders);
    fetchedForm = form;
    if (form.success && form.questions) {
      for (const question of form.questions) {
        const value = flatAnswers[question.urn];
        if (value === undefined || value === null) continue;
        // Skip already-encoded values
        if (value.includes('|')) continue;

        if (question.options && question.optionUrns && question.optionUrns.length > 0) {
          // Field has proper URNs (country, location)
          const idx = question.options.indexOf(value);
          if (idx !== -1 && question.optionUrns[idx]) {
            enrichedAnswers[question.urn] = `${value}|${question.optionUrns[idx]}`;
          }
        } else if (question.options && question.optionEnumStrings && question.optionEnumStrings.length > 0) {
          // Field uses enum strings (multipleChoice Yes/No, email dropdowns)
          const idx = question.options.indexOf(value);
          if (idx !== -1 && question.optionEnumStrings[idx]) {
            // Encode as "Label||enumString" (double-pipe = enum sentinel)
            enrichedAnswers[question.urn] = `${value}||${question.optionEnumStrings[idx]}`;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[submitApplyForm] Failed to enrich answers from form:`, err);
  }

  // Use pre-typed responses when available, otherwise convert the flat map
  const responses: FormResponse[] =
    options?.formResponses && options.formResponses.length > 0
      ? options.formResponses
      : convertFlatAnswersToResponses(enrichedAnswers);

  // referenceId MUST come from the GET apply-form response.
  // If missing, resolve from the fetched form. Default to 'NotAvailable'.
  const referenceId = options?.referenceId ?? fetchedForm?.referenceId ?? 'NotAvailable';

  const trackingId = options?.trackingId ?? generateTrackingId();

  // Build fileUploadResponses: fallback to fetchedForm resume if options not provided
  let fileUploadResponses = options?.fileUploadResponses;
  if (!fileUploadResponses && fetchedForm?.resumeUploadFormElementUrn && fetchedForm?.resumeUrns?.length > 0) {
    fileUploadResponses = [{
      inputUrn: fetchedForm.resumeUrns[0],
      formElementUrn: fetchedForm.resumeUploadFormElementUrn,
    }];
  }

  const payload: SubmitPayload = {
    followCompany: true,
    responses,
    referenceId,
    trackingCode: 'TRK_INITIAL_PAGE_LOAD',
    trackingId,
    ...(fileUploadResponses?.length
      ? { fileUploadResponses }
      : {}),
  };

  // ── Debug dump ──────────────────────────────────────────────────────────────
  try {
    writeFileSync('/tmp/linkedin-submit-payload.json', JSON.stringify(payload, null, 2));
  } catch {
    /* ignore */
  }

  // ── Headers matching the working curl ───────────────────────────────────────
  const headers: Record<string, string> = {
    ...getHeaders(cookie, csrf, dynamicHeaders),
    'content-type': 'application/json; charset=UTF-8',
    'x-li-page-instance': `urn:li:page:d_flagship3_jobs_discovery_jymbii;${randomBytes(16).toString('base64')}`,
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'origin': 'https://www.linkedin.com',
    'referer': 'https://www.linkedin.com/preload/?_bprMode=vanilla',
    'x-li-lang': 'pt_BR',
    'priority': 'u=1, i',
    'sec-ch-prefers-color-scheme': 'dark',
    'dnt': '1',
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    redirect: 'manual',
  });

  // Read body BEFORE checking status (can only be consumed once)
  let responseText = '';
  let jsonData: Record<string, unknown> | null = null;
  try {
    responseText = await response.text();
    if (responseText) {
      jsonData = JSON.parse(responseText) as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }

  // ── Debug dump ──────────────────────────────────────────────────────────────
  try {
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });
    writeFileSync(
      '/tmp/linkedin-submit-response.json',
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: jsonData ?? responseText,
      }, null, 2),
    );
  } catch {
    /* ignore */
  }

  if (!response.ok) {
    const errorDetail = jsonData
      ? ((jsonData['message'] as string | undefined) ??
         ((jsonData['errors'] as Array<Record<string, string>> | undefined)?.[0]?.['message']) ??
         JSON.stringify(jsonData).slice(0, 500))
      : responseText.slice(0, 500);

    return {
      success: false,
      message: `LinkedIn API retornou ${response.status}: ${errorDetail}`,
    };
  }

  // LinkedIn returns { entityUrn: "urn:li:fsd_jobApplication:..." } on success
  if (
    (jsonData?.['entityUrn'] as string | undefined) ||
    ((jsonData?.['value'] as Record<string, unknown> | undefined)?.['entityUrn'] as string | undefined)
  ) {
    return { success: true, message: 'Candidatura enviada com sucesso!' };
  }

  // 200 with no body / no entityUrn — treat as success unless there's an error key
  if (jsonData?.['message']) {
    return { success: false, message: jsonData['message'] as string };
  }

  return { success: true, message: 'Candidatura enviada com sucesso!' };
}
