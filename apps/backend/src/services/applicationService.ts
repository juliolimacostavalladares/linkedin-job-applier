import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationService {
  async save(
    jobId: string, 
    answers: any, 
    status: string = 'applied',
    metadata?: { jobTitle?: string; companyName?: string; companyLogo?: string; jobUrl?: string }
  ) {
    return await prisma.application.create({
      data: {
        id: uuidv4(),
        jobId,
        answers: typeof answers === 'string' ? answers : JSON.stringify(answers),
        status,
        jobTitle: metadata?.jobTitle,
        companyName: metadata?.companyName,
        companyLogo: metadata?.companyLogo,
        jobUrl: metadata?.jobUrl,
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
      where: { status: 'applied' },
      select: { jobId: true }
    });
    return apps.map(app => app.jobId);
  }
}

export const applicationService = new ApplicationService();
