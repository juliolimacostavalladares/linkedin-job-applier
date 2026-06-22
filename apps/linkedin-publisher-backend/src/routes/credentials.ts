import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';

const router = Router();

/**
 * @openapi
 * /api/credentials/status:
 *   get:
 *     tags:
 *       - Credentials
 *     operationId: getPublisherCredentialsStatus
 *     summary: Check credential status
 *     description: Returns whether the publisher backend currently stores session credentials and when they were updated.
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
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: "2026-06-21T18:00:00.000Z"
 */
router.get('/status', async (_req, res) => {
  try {
    const creds = await credentialsService.getLatest();
    res.json({
      hasCredentials: !!creds,
      updatedAt: creds?.updatedAt ?? null,
    });
  } catch (error) {
    console.error('Error in status check:', error);
    res.status(500).json({ error: 'Erro ao verificar credenciais' });
  }
});

/**
 * @openapi
 * /api/credentials:
 *   post:
 *     tags:
 *       - Credentials
 *     operationId: savePublisherCredentials
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
 *                 description: Full LinkedIn session cookie string
 *                 example: "li_at=AQED...; JSESSIONID=\"ajax:123456\";"
 *               csrf:
 *                 type: string
 *                 description: Plain CSRF token extracted from JSESSIONID
 *                 example: "ajax:123456"
 *               headers:
 *                 type: object
 *                 description: Client environment headers
 *     responses:
 *       200:
 *         description: Credentials saved successfully
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
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required fields
 */
router.post('/', async (req, res) => {
  try {
    const { cookie, csrf, headers } = req.body as { cookie?: string; csrf?: string; headers?: Record<string, string> };

    if (!cookie || !csrf) {
      res.status(400).json({ error: 'Os campos `cookie` e `csrf` são obrigatórios.' });
      return;
    }

    const headersJson = headers ? JSON.stringify(headers) : null;
    const saved = await credentialsService.getOrCreate(cookie, csrf, headersJson);

    res.json({ success: true, id: saved.id, updatedAt: saved.updatedAt });
  } catch (error) {
    console.error('Error saving credentials:', error);
    res.status(500).json({ error: 'Erro ao salvar credenciais' });
  }
});

export default router;
