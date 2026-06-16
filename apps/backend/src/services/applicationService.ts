import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationService {
  async save(jobId: string, answers: any[]) {
    return await prisma.application.create({
      data: {
        id: uuidv4(),
        jobId,
        answers: JSON.stringify(answers),
        status: 'draft',
      },
    });
  }

  async listByJob(jobId: string) {
    return await prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const applicationService = new ApplicationService();
