import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { queryGraphQL } from '../utils/graphqlClient';
import { aiService } from './aiService';
import { logger } from '../utils/logger';
import type { ParsedResume } from '../types';

export class ResumeService {
  async upsert(
    profileId: string | null,
    text: string,
    filename?: string | null,
    profileInfo?: {
      name?: string | null;
      headline?: string | null;
      photoUrl?: string | null;
      about?: string | null;
      experienceJson?: string | null;
      educationJson?: string | null;
    }
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
    };

    if (profileId) {
      return await prisma.resume.upsert({
        where: { profileId },
        update: data,
        create: { id: uuidv4(), profileId, ...data },
      });
    }

    const latest = await prisma.resume.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (latest) {
      return await prisma.resume.update({
        where: { id: latest.id },
        data,
      });
    }

    return await prisma.resume.create({
      data: { id: uuidv4(), ...data },
    });
  }

  async syncProfile(cookie: string, csrf: string) {
    logger.info('Starting syncProfile from LinkedIn');
    
    // 1. Fetch profileInfo from GraphQL
    const profileInfoQuery = `
      query GetProfileInfo($cookie: String!, $csrf: String!) {
        profileInfo(cookie: $cookie, csrf: $csrf) {
          success
          profileId
          name
          headline
          photoUrl
        }
      }
    `;
    const profileData = await queryGraphQL<{
      profileInfo: {
        success: boolean;
        profileId: string;
        name: string;
        headline: string;
        photoUrl: string;
      };
    }>(profileInfoQuery, { cookie, csrf });

    const { profileId, name, headline, photoUrl } = profileData.profileInfo;

    // 2. Fetch PDF resume from GraphQL
    const pdfQuery = `
      query GetResumePdf($profileId: String!, $cookie: String!, $csrf: String!) {
        resumePdf(profileId: $profileId, cookie: $cookie, csrf: $csrf) {
          success
          text
        }
      }
    `;
    const pdfData = await queryGraphQL<{
      resumePdf: {
        success: boolean;
        text: string;
      };
    }>(pdfQuery, { profileId, cookie, csrf });

    const pdfText = pdfData.resumePdf.text;

    // 3. Parse PDF with AI
    let parsedResume: ParsedResume = { about: '', experiences: [], education: [] };
    try {
      parsedResume = await aiService.parseResume(pdfText);
    } catch (aiErr) {
      logger.error('Error parsing resume with Gemini, using fallback', { error: aiErr });
      // If parsing fails, extract a simple fallback 'about' from first part of text
      parsedResume.about = pdfText.substring(0, 500) + '...';
    }

    // 4. Save to DB
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
      filename: 'Curriculo_LinkedIn.pdf'
    };
  }

  async getLatest() {
    return await prisma.resume.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export const resumeService = new ResumeService();
