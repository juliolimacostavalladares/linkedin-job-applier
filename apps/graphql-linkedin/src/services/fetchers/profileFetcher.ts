import pdfParse from 'pdf-parse';
import { logger } from '../../utils/logger';
import { getHeaders, handleResponseError } from '../http/linkedinHttpClient';
import { fetchResumePdf } from './pdfFetcher';
import { parsePdfText } from '../parsers/pdfTextParser';
import type { WorkExperience, Education } from '@linkedin-job-applier/shared';
import type { LinkedInGraphQLResponse } from '../../types/linkedin';

export interface ProfileInfo {
  success: boolean;
  profileId: string;
  name: string;
  headline: string;
  photoUrl: string;
  about: string;
  experiences: WorkExperience[];
  education: Education[];
}

/**
 * Fetches the current user's profile via /voyager/api/me, then enriches it
 * with structured data parsed from the profile PDF download.
 */
export async function fetchProfileInfo(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
): Promise<ProfileInfo> {
  // ── Step 1: Basic identity from /me ───────────────────────────────────────
  const apiUrl = 'https://www.linkedin.com/voyager/api/me';
  logger.debug('Fetching profile identity from LinkedIn /me API');

  const response = await fetch(apiUrl, {
    headers: getHeaders(cookie, csrf, dynamicHeaders),
    redirect: 'manual',
  });

  handleResponseError(response);

  const json = (await response.json()) as LinkedInGraphQLResponse;
  const miniProfile = json.included?.find(
    (item) => item.$type === 'com.linkedin.voyager.identity.shared.MiniProfile',
  );

  if (!miniProfile) {
    throw new Error('MiniProfile não encontrado na resposta do LinkedIn');
  }

  const firstName = miniProfile.firstName ?? '';
  const lastName = miniProfile.lastName ?? '';
  const name = `${firstName} ${lastName}`.trim();
  const headline = miniProfile.occupation ?? '';
  const profileId = miniProfile.entityUrn?.split(':').pop() ?? '';

  let photoUrl = '';
  const pic = miniProfile.picture;
  if (pic?.rootUrl && pic.artifacts && pic.artifacts.length > 0) {
    const artifact =
      pic.artifacts.find((art) => art.width === 200) ?? pic.artifacts[0];
    photoUrl = pic.rootUrl + artifact.fileIdentifyingUrlPathSegment;
  }

  // ── Step 2: Enrich with PDF-parsed data ───────────────────────────────────
  let about = '';
  let experiences: WorkExperience[] = [];
  let education: Education[] = [];

  try {
    logger.debug('Downloading LinkedIn profile PDF for parsing', { profileId });
    const pdfBuffer = await fetchResumePdf(profileId, cookie, csrf);
    const pdfData = await pdfParse(Buffer.from(pdfBuffer));
    const pdfText = pdfData.text ?? '';
    logger.info('PDF downloaded and parsed successfully', {
      profileId,
      textLength: pdfText.length,
    });

    const parsed = parsePdfText(pdfText);
    about = parsed.about;
    experiences = parsed.experiences;
    education = parsed.education;
  } catch (err) {
    logger.error(
      'Error downloading/parsing profile PDF — using partial identity only',
      { error: err },
    );
  }

  logger.info('Fetched complete profile info via PDF parsing', {
    name,
    profileId,
  });

  return {
    success: true,
    profileId,
    name,
    headline,
    photoUrl,
    about,
    experiences,
    education,
  };
}
