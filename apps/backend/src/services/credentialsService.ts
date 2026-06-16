import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export class CredentialsService {
  async getOrCreate(cookie: string, csrf: string) {
    const existing = await prisma.credentials.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      if (existing.cookie !== cookie || existing.csrf !== csrf) {
        logger.info('Updating credentials');
        return await prisma.credentials.update({
          where: { id: existing.id },
          data: { cookie, csrf },
        });
      }
      return existing;
    }

    logger.info('Creating new credentials');
    return await prisma.credentials.create({
      data: {
        id: uuidv4(),
        cookie,
        csrf,
      },
    });
  }

  async getLatest() {
    return await prisma.credentials.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCookieAndCsrf(): Promise<{ cookie: string; csrf: string } | null> {
    const creds = await this.getLatest();
    if (!creds) return null;
    return { cookie: creds.cookie, csrf: creds.csrf };
  }
}

export const credentialsService = new CredentialsService();
