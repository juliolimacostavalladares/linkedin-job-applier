import { Router } from 'express';
import { resumeService } from '../services/resumeService';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
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

    const query = `
      query GetResumePdf($profileId: String!, $cookie: String!, $csrf: String!) {
        resumePdf(profileId: $profileId, cookie: $cookie, csrf: $csrf) {
          success
          text
          pdfBase64
        }
      }
    `;

    interface ResumePdfResponse {
      resumePdf: {
        success: boolean;
        text: string;
        pdfBase64: string;
      };
    }

    const data = await queryGraphQL<ResumePdfResponse>(query, {
      profileId,
      cookie: creds.cookie,
      csrf: creds.csrf,
    });

    const result = data.resumePdf;

    await resumeService.upsert(profileId, result.text, 'Curriculo_LinkedIn.pdf');

    res.json({ success: true, text: result.text, pdfBase64: result.pdfBase64 });
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
