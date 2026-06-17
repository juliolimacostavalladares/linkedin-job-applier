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
    const data = {
      text,
      filename,
      name: profileInfo?.name,
      headline: profileInfo?.headline,
      photoUrl: profileInfo?.photoUrl,
      about: profileInfo?.about,
      experienceJson: profileInfo?.experienceJson,
      educationJson: profileInfo?.educationJson,
      searchQuery: null, // Reset cached query so it is regenerated on next load
    };

    if (profileId) {
      return prisma.resume.upsert({
        where: { profileId },
        update: data,
        create: { id: uuidv4(), profileId, ...data },
      });
    }

    const latest = await prisma.resume.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (latest) {
      return prisma.resume.update({ where: { id: latest.id }, data });
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
}

export const resumeService = new ResumeService();
