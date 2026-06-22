import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { resumeService } from '../services/resumeService';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/credentials/status – used by frontend to check if credentials exist
/**
 * @openapi
 * /api/credentials/status:
 *   get:
 *     tags:
 *       - Credentials
 *     operationId: getCredentialsStatus
 *     summary: Get credentials status
 *     description: Returns whether the backend currently stores session credentials and when they were updated.
 *     responses:
 *       200:
 *         description: Credentials status checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasCredentials:
 *                   type: boolean
 *                   example: true
 *                 jobCount:
 *                   type: integer
 *                   example: 0
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: "2026-06-21T18:00:00.000Z"
 */
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
/**
 * @openapi
 * /api/credentials:
 *   post:
 *     tags:
 *       - Credentials
 *     operationId: saveSessionCredentials
 *     summary: Save session credentials
 *     description: Receives the LinkedIn session cookies, CSRF tokens, and client environment headers synced from the Chrome extension.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cookie
 *               - csrf
 *             properties:
 *               cookie:
 *                 type: string
 *                 description: Full LinkedIn session cookie string (contains li_at, JSESSIONID, etc.)
 *                 example: "li_at=AQED...; JSESSIONID=\"ajax:123456\";"
 *               csrf:
 *                 type: string
 *                 description: Plain CSRF token extracted from JSESSIONID cookie.
 *                 example: "ajax:123456"
 *               headers:
 *                 type: object
 *                 description: Dictionary of client user-agent, tracking tags, and platform headers.
 *                 example: { "user-agent": "Mozilla/...", "x-li-track": "..." }
 *     responses:
 *       200:
 *         description: Credentials saved and synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "3927491-a837-..."
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-06-21T18:00:00.000Z"
 *       400:
 *         description: Bad request (missing required fields)
 */
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
