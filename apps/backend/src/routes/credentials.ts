import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { resumeService } from '../services/resumeService';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/credentials/status – used by frontend to check if credentials exist
router.get('/status', async (_req, res, next) => {
  try {
    const creds = await credentialsService.getLatest();
    res.json({
      hasCredentials: !!creds,
      jobCount: 0,
      updatedAt: creds?.updatedAt ?? null,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/credentials – called by the Chrome extension to save session credentials
router.post('/', async (req, res, next) => {
  try {
    const { cookie, csrf, headers } = req.body as { cookie?: string; csrf?: string; headers?: Record<string, string> };

    if (!cookie || !csrf) {
      res.status(400).json({ error: 'Os campos `cookie` e `csrf` são obrigatórios.' });
      return;
    }

    const headersJson = headers ? JSON.stringify(headers) : null;
    const saved = await credentialsService.getOrCreate(cookie, csrf, headersJson);
    logger.info('Credentials saved via extension', { id: saved.id });

    // Trigger background sync for LinkedIn profile and resume parsing
    resumeService.syncProfile(cookie, csrf).catch((err: unknown) => {
      logger.error('Error in background profile sync:', err);
    });

    res.json({ success: true, id: saved.id, updatedAt: saved.updatedAt });
  } catch (error) {
    next(error);
  }
});

export default router;
