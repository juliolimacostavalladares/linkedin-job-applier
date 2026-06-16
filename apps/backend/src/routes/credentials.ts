import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { jobService } from '../services/jobService';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/credentials/status – used by frontend to check if credentials exist
router.get('/status', async (_req, res, next) => {
  try {
    const creds = await credentialsService.getLatest();
    const jobs  = await jobService.getAll();
    res.json({
      hasCredentials: !!creds,
      jobCount: jobs.length,
      updatedAt: creds?.updatedAt ?? null,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/credentials – called by the Chrome extension to save session credentials
router.post('/', async (req, res, next) => {
  try {
    const { cookie, csrf } = req.body as { cookie?: string; csrf?: string };

    if (!cookie || !csrf) {
      res.status(400).json({ error: 'Os campos `cookie` e `csrf` são obrigatórios.' });
      return;
    }

    const saved = await credentialsService.getOrCreate(cookie, csrf);
    logger.info('Credentials saved via extension', { id: saved.id });

    res.json({ success: true, id: saved.id, updatedAt: saved.updatedAt });
  } catch (error) {
    next(error);
  }
});

export default router;
