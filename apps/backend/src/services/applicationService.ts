import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

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
}

export const applicationService = new ApplicationService();
