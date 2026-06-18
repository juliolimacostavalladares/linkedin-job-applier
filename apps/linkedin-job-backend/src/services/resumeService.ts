import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { queryGraphQL } from '../utils/graphqlClient';
import { aiService } from './aiService';
import { logger } from '../utils/logger';
import type { ParsedResume } from '../types';

// ─── DB helpers ────────────────────────────────────────────────────────────────

interface UpsertProfileInfo {
  name?: string | null;
  headline?: string | null;
  photoUrl?: string | null;
  about?: string | null;
  experienceJson?: string | null;
  educationJson?: string | null;
}

export class ResumeService {
  /**
   * Creates or updates a resume record.
   * When `profileId` is provided, upserts by profileId (preferred).
   * Falls back to latest record when no profileId is available.
   */
  async upsert(
    profileId: string | null,
    text: string,
    filename?: string | null,
    profileInfo?: UpsertProfileInfo
  ) {
    const existing = profileId 
      ? await prisma.resume.findUnique({ where: { profileId } }) 
      : await prisma.resume.findFirst({ orderBy: { updatedAt: 'desc' } });

    const data = {
      text: text || existing?.text || '',
      filename: filename || existing?.filename || null,
      name: profileInfo?.name || existing?.name || null,
      headline: profileInfo?.headline || existing?.headline || null,
      photoUrl: profileInfo?.photoUrl || existing?.photoUrl || null,
      about: profileInfo?.about || existing?.about || null,
      experienceJson: (profileInfo?.experienceJson && profileInfo.experienceJson !== '[]') 
        ? profileInfo.experienceJson 
        : existing?.experienceJson || null,
      educationJson: (profileInfo?.educationJson && profileInfo.educationJson !== '[]') 
        ? profileInfo.educationJson 
        : existing?.educationJson || null,
      searchQuery: null, // Reset cached query so it is regenerated on next load
    };

    if (profileId) {
      return prisma.resume.upsert({
        where: { profileId },
        update: data,
        create: { id: uuidv4(), profileId, ...data },
      });
    }

    if (existing) {
      return prisma.resume.update({ where: { id: existing.id }, data });
    }

    return prisma.resume.create({ data: { id: uuidv4(), ...data } });
  }

  /**
   * Full profile sync flow:
   * 1. GET /voyager/api/me → identity (name, headline, photoUrl, profileId)
   * 2. GET resumePdf (GraphQL) → raw PDF text
   * 3. aiService.parseResume → structured { about, experiences, education }
   * 4. upsert to DB
   */
  async syncProfile(cookie: string, csrf: string, headersJson?: string | null) {
    logger.info('Starting syncProfile from LinkedIn');

    // ── Step 1: fetch identity ────────────────────────────────────────────────
    const identityQuery = `
      query GetProfileInfo($cookie: String!, $csrf: String!, $headersJson: String) {
        profileInfo(cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          profileId
          name
          headline
          photoUrl
        }
      }
    `;

    interface IdentityResponse {
      profileInfo: {
        success: boolean;
        profileId: string;
        name: string;
        headline: string;
        photoUrl: string;
      };
    }

    const identityData = await queryGraphQL<IdentityResponse>(identityQuery, {
      cookie,
      csrf,
      headersJson,
    });
    const { profileId, name, headline, photoUrl } = identityData.profileInfo;
    logger.info('Profile identity fetched', { profileId, name });

    // ── Step 2: download + parse PDF text ────────────────────────────────────
    const pdfQuery = `
      query GetResumePdf($profileId: String!, $cookie: String!, $csrf: String!, $headersJson: String) {
        resumePdf(profileId: $profileId, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          text
        }
      }
    `;

    interface PdfResponse {
      resumePdf: {
        success: boolean;
        text: string;
      };
    }

    const pdfData = await queryGraphQL<PdfResponse>(pdfQuery, {
      profileId,
      cookie,
      csrf,
      headersJson,
    });
    const pdfText = pdfData.resumePdf.text;
    logger.info('PDF text extracted', { chars: pdfText.length });

    // ── Step 3: AI-powered structured parsing ─────────────────────────────────
    let parsedResume: ParsedResume = { about: '', experiences: [], education: [] };
    try {
      parsedResume = await aiService.parseResume(pdfText);
      logger.info('AI resume parsing complete', {
        experiences: parsedResume.experiences.length,
        education: parsedResume.education.length,
      });
    } catch (aiErr) {
      logger.error('AI resume parsing failed — using raw text as fallback', { error: aiErr });
      parsedResume.about = pdfText.substring(0, 600);
    }

    // ── Step 4: persist ───────────────────────────────────────────────────────
    await this.upsert(profileId, pdfText, 'Curriculo_LinkedIn.pdf', {
      name,
      headline,
      photoUrl,
      about: parsedResume.about,
      experienceJson: JSON.stringify(parsedResume.experiences),
      educationJson: JSON.stringify(parsedResume.education),
    });

    return {
      profileId,
      name,
      headline,
      photoUrl,
      about: parsedResume.about,
      experiences: parsedResume.experiences,
      education: parsedResume.education,
      text: pdfText,
      filename: 'Curriculo_LinkedIn.pdf',
    };
  }

  async getLatest() {
    return prisma.resume.findFirst({ orderBy: { updatedAt: 'desc' } });
  }

  /**
   * Uploads a resume PDF buffer to LinkedIn using the Ambry flow and returns the fsd_resume URN.
   */
  async uploadResumeToLinkedIn(
    cookie: string,
    csrf: string,
    pdfBuffer: Buffer,
    filename: string,
    headersJson?: string | null
  ): Promise<string> {
    logger.info(`Starting Ambry resume upload to LinkedIn: ${filename} (${pdfBuffer.length} bytes)`);

    const dynamicHeaders = headersJson ? (JSON.parse(headersJson) as Record<string, string>) : {};
    const baseHeaders = {
      'accept': 'application/vnd.linkedin.normalized+json+2.1',
      'csrf-token': csrf,
      'cookie': cookie,
      'x-restli-protocol-version': '2.0.0',
      'content-type': 'application/json; charset=UTF-8',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    };

    const headers = {
      ...baseHeaders,
      ...dynamicHeaders,
      'csrf-token': csrf,
      'cookie': cookie,
    };

    const initUrl = 'https://www.linkedin.com/voyager/api/voyagerJobsDashAmbryUploadUrls?action=requestUrl';

    // Step 1: Request upload URL
    const registerResponse = await fetch(initUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contentType: 'PDF',
        filename,
        maxSizeBytes: pdfBuffer.length,
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      logger.error(`Failed to request Ambry upload URL. Status: ${registerResponse.status}`, { errorText });
      throw new Error(`LinkedIn Ambry upload URL request failed: ${registerResponse.statusText}`);
    }

    const registerData = (await registerResponse.json()) as {
      data?: {
        value?: string;
      };
    };

    const uploadUrl = registerData?.data?.value;
    if (!uploadUrl) {
      logger.error('No upload URL returned from LinkedIn requestUrl endpoint', { registerData });
      throw new Error('Invalid upload URL response from LinkedIn');
    }

    logger.info(`Ambry upload URL obtained successfully. Uploading binary buffer...`);

    // Step 2: POST binary content to Ambry upload URL
    const uploadHeaders: Record<string, string> = {
      'cookie': cookie,
      'csrf-token': csrf,
      'user-agent': headers['user-agent'],
      'content-type': 'application/pdf',
    };

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: uploadHeaders,
      body: pdfBuffer,
    });

    if (!uploadRes.ok) {
      const uploadText = await uploadRes.text();
      logger.error(`Failed to upload PDF binary via POST to Ambry. Status: ${uploadRes.status}`, { uploadText });
      throw new Error(`LinkedIn Ambry PDF upload failed: ${uploadRes.statusText}`);
    }

    // Step 3: Extract location header and construct the fsd_resume URN
    const locationHeader = uploadRes.headers.get('location');
    if (!locationHeader) {
      logger.error('No location header returned from Ambry upload response', {
        headers: Object.fromEntries(uploadRes.headers.entries()),
      });
      throw new Error('Ambry upload response missing location header');
    }

    const resumeUrn = `urn:li:fsd_resume:${locationHeader}`;
    logger.info(`Resume successfully uploaded and registered via Ambry. URN: ${resumeUrn}`);
    return resumeUrn;
  }
}

export const resumeService = new ResumeService();
