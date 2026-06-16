import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import type { Job } from '@linkedin-job-applier/shared';

interface UpsertJob {
  linkedinId: string;
  title: string;
  companyInfo: string;
  companyLogo?: string | null;
  description?: string | null;
  location?: string | null;
  url?: string | null;
  employmentStatus?: string | null;
  companyName?: string | null;
}

export class JobService {
  /** Persist / upsert a list of jobs fetched from LinkedIn API */
  async saveFromLinkedIn(rawJobs: Job[]): Promise<number> {
    const jobs: UpsertJob[] = rawJobs.map((j) => ({
      linkedinId:  j.id,
      title:       j.title,
      companyInfo: j.companyInfo,
      companyLogo: j.companyLogo || null,
    }));

    await prisma.$transaction(
      jobs.map((job) =>
        prisma.job.upsert({
          where:  { linkedinId: job.linkedinId },
          update: {
            title:       job.title,
            companyInfo: job.companyInfo,
            companyLogo: job.companyLogo,
          },
          create: { id: uuidv4(), ...job },
        })
      )
    );

    return jobs.length;
  }

  /** Save / update detail fields for a specific job */
  async saveJobDetail(detail: {
    id: string;
    title?: string;
    description?: string;
    location?: string;
    url?: string;
    employmentStatus?: string;
    companyName?: string;
    companyLogo?: string;
  }): Promise<void> {
    if (!detail?.id) return;

    await prisma.job.upsert({
      where:  { linkedinId: detail.id },
      update: {
        description:      detail.description,
        location:         detail.location,
        url:              detail.url,
        employmentStatus: detail.employmentStatus,
        companyName:      detail.companyName,
        companyLogo:      detail.companyLogo || undefined,
      },
      create: {
        id:               uuidv4(),
        linkedinId:       detail.id,
        title:            detail.title ?? 'Vaga',
        companyInfo:      detail.companyName ?? '',
        description:      detail.description,
        location:         detail.location,
        url:              detail.url,
        employmentStatus: detail.employmentStatus,
        companyName:      detail.companyName,
        companyLogo:      detail.companyLogo || null,
      },
    });
  }

  /** Return all persisted jobs */
  async getAll() {
    return prisma.job.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  /** Find a single job by its LinkedIn ID */
  async getByLinkedinId(linkedinId: string) {
    return prisma.job.findUnique({ where: { linkedinId } });
  }
}

export const jobService = new JobService();
