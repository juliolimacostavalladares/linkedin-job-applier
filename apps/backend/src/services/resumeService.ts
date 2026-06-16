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
      const existing = await prisma.resume.findFirst({
        where: {
          OR: [
            { profileId },
            { profileId: null }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (existing) {
        return await prisma.resume.update({
          where: { id: existing.id },
          data: { profileId, ...data }
        });
      }

      return await prisma.resume.create({
        data: { id: uuidv4(), profileId, ...data }
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

  async syncProfile(cookie: string, csrf: string, headersJson?: string | null) {
    logger.info('Starting syncProfile from LinkedIn');
    
    // 1. Fetch profileInfo from GraphQL (including about, experiences, education)
    const profileInfoQuery = `
      query GetProfileInfo($cookie: String!, $csrf: String!, $headersJson: String) {
        profileInfo(cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          profileId
          name
          headline
          photoUrl
          about
          experiences {
            company
            role
            duration
            description
          }
          education {
            institution
            degree
            duration
          }
        }
      }
    `;

    interface WorkExperience {
      company: string;
      role: string;
      duration: string;
      description: string;
    }

    interface Education {
      institution: string;
      degree: string;
      duration: string;
    }

    interface ProfileInfoResponse {
      profileInfo: {
        success: boolean;
        profileId: string;
        name: string;
        headline: string;
        photoUrl: string;
        about: string;
        experiences: WorkExperience[];
        education: Education[];
      };
    }

    const profileData = await queryGraphQL<ProfileInfoResponse>(profileInfoQuery, { cookie, csrf, headersJson });
    const { profileId, name, headline, photoUrl, about, experiences, education } = profileData.profileInfo;

    // 2. Reconstruct plain text resume
    let reconstructedText = `${name}\n${headline}\n\n`;
    if (about) {
      reconstructedText += `SOBRE\n${about}\n\n`;
    }
    if (experiences && experiences.length > 0) {
      reconstructedText += `EXPERIÊNCIA\n`;
      experiences.forEach((exp) => {
        reconstructedText += `- ${exp.role} em ${exp.company} (${exp.duration})\n`;
        if (exp.description) {
          reconstructedText += `  ${exp.description}\n`;
        }
      });
      reconstructedText += `\n`;
    }
    if (education && education.length > 0) {
      reconstructedText += `EDUCAÇÃO\n`;
      education.forEach((edu) => {
        reconstructedText += `- ${edu.institution}: ${edu.degree} (${edu.duration})\n`;
      });
      reconstructedText += `\n`;
    }
    const pdfText = reconstructedText.trim();

    // 3. Save to DB
    await this.upsert(profileId, pdfText, 'Curriculo_LinkedIn.pdf', {
      name,
      headline,
      photoUrl,
      about,
      experienceJson: JSON.stringify(experiences),
      educationJson: JSON.stringify(education),
    });

    return {
      profileId,
      name,
      headline,
      photoUrl,
      about,
      experiences,
      education,
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
