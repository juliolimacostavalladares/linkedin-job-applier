import { prisma } from '../lib/prisma';

export class CredentialsService {
  async getOrCreate(cookie: string, csrf: string, headersJson?: string | null) {
    const existing = await prisma.credentials.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      if (existing.cookie !== cookie || existing.csrf !== csrf || existing.headersJson !== headersJson) {
        return await prisma.credentials.update({
          where: { id: existing.id },
          data: { cookie, csrf, headersJson },
        });
      }
      return existing;
    }

    return await prisma.credentials.create({
      data: {
        cookie,
        csrf,
        headersJson,
      },
    });
  }

  async getLatest() {
    return await prisma.credentials.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCookieAndCsrf(): Promise<{ cookie: string; csrf: string; headersJson: string | null } | null> {
    const creds = await this.getLatest();
    if (!creds) return null;
    return { cookie: creds.cookie, csrf: creds.csrf, headersJson: creds.headersJson };
  }
}

export const credentialsService = new CredentialsService();
