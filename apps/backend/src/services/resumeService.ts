import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class ResumeService {
  async upsert(profileId: string | null, text: string, filename?: string | null) {
    if (profileId) {
      return await prisma.resume.upsert({
        where: { profileId },
        update: { text, filename },
        create: { id: uuidv4(), profileId, text, filename },
      });
    }

    const latest = await prisma.resume.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (latest) {
      return await prisma.resume.update({
        where: { id: latest.id },
        data: { text, filename },
      });
    }

    return await prisma.resume.create({
      data: { id: uuidv4(), text, filename },
    });
  }

  async getLatest() {
    return await prisma.resume.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export const resumeService = new ResumeService();
