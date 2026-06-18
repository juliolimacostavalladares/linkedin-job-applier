import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export function isAppliedThroughSystem(app: {
  answers?: string | null;
  optimizedResume?: string | null;
  resumePdfPath?: string | null;
  resumePdfBase64?: string | null;
}): boolean {
  const hasAnswers = !!(app.answers && app.answers !== '{}' && app.answers !== 'null' && app.answers !== '');
  const hasResume = !!(app.optimizedResume || app.resumePdfPath || app.resumePdfBase64);
  return hasAnswers || hasResume;
}

export class ApplicationService {
  async save(
    jobId: string, 
    answers: unknown, 
    status: string = 'applied',
    metadata?: { 
      jobTitle?: string; 
      companyName?: string; 
      companyLogo?: string; 
      jobUrl?: string;
      optimizedResume?: string;
      resumePdfPath?: string;
      resumePdfBase64?: string;
    }
  ) {
    return await prisma.application.create({
      data: {
        id: uuidv4(),
        jobId,
        answers: typeof answers === 'string' ? answers : JSON.stringify(answers || {}),
        status,
        jobTitle: metadata?.jobTitle,
        companyName: metadata?.companyName,
        companyLogo: metadata?.companyLogo,
        jobUrl: metadata?.jobUrl,
        optimizedResume: metadata?.optimizedResume,
        resumePdfPath: metadata?.resumePdfPath,
        resumePdfBase64: metadata?.resumePdfBase64,
      },
    });
  }

  async listByJob(jobId: string) {
    return await prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAppliedJobIds(): Promise<string[]> {
    const apps = await prisma.application.findMany({
      where: { status: { in: ['applied', 'viewed', 'closed'] } },
      select: { jobId: true }
    });
    return apps.map(app => app.jobId);
  }

  async listAppliedInfo(): Promise<Map<string, { appliedThroughSystem: boolean }>> {
    const apps = await prisma.application.findMany({
      where: { status: { in: ['applied', 'viewed', 'closed'] } },
      select: { jobId: true, answers: true, optimizedResume: true, resumePdfPath: true, resumePdfBase64: true }
    });
    const map = new Map<string, { appliedThroughSystem: boolean }>();
    for (const app of apps) {
      map.set(app.jobId, { appliedThroughSystem: isAppliedThroughSystem(app) });
    }
    return map;
  }

  async listAll() {
    return await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(jobId: string, status: string) {
    const existing = await prisma.application.findFirst({
      where: { jobId },
    });
    if (existing) {
      return await prisma.application.update({
        where: { id: existing.id },
        data: { status },
      });
    }
    return null;
  }

  async deleteByJobId(jobId: string) {
    return await prisma.application.deleteMany({
      where: { jobId },
    });
  }

  async findById(id: string) {
    return await prisma.application.findUnique({
      where: { id },
    });
  }
}

export const applicationService = new ApplicationService();
