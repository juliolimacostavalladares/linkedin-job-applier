import { Router } from 'express';
import { LinkedInService } from '../services/linkedinService';
import { resumeService } from '../services/resumeService';
import { credentialsService } from '../services/credentialsService';
import pdfParse from 'pdf-parse';
import { validateProfileId } from '../middleware/validator';

const router = Router();

// POST /api/resume/from-linkedin
router.post('/from-linkedin', async (req, res, next) => {
  try {
    const { profileId } = req.body;
    validateProfileId(profileId);

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      return res.status(401).json({ error: 'Credenciais do LinkedIn ausentes no servidor.' });
    }

    const linkedInService = new LinkedInService(creds.cookie, creds.csrf);
    const buffer = await linkedInService.fetchResumePdf(profileId);

    const parsedData = await pdfParse(Buffer.from(buffer));
    const pdfBase64 = Buffer.from(buffer).toString('base64');

    await resumeService.upsert(profileId, parsedData.text, 'Curriculo_LinkedIn.pdf');

    res.json({ success: true, text: parsedData.text, pdfBase64 });
  } catch (error) {
    next(error);
  }
});

// POST /api/resume - Save resume text directly
router.post('/', async (req, res, next) => {
  try {
    const { text, filename, profileId } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto do currículo é obrigatório' });
    }
    const resume = await resumeService.upsert(profileId || null, text, filename || null);
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
});

// GET /api/resume/latest - Get latest resume
router.get('/latest', async (req, res, next) => {
  try {
    const resume = await resumeService.getLatest();
    res.json({ resume });
  } catch (error) {
    next(error);
  }
});

export default router;
