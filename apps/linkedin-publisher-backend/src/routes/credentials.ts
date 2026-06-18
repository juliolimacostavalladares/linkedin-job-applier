import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';

const router = Router();

// GET /api/credentials/status – used by frontend to check if credentials exist
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

// POST /api/credentials – called by the Chrome extension to save session credentials
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
