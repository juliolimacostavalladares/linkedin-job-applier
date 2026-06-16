import { Router } from 'express';
import { LinkedInService } from '../services/linkedinService';
import { credentialsService } from '../services/credentialsService';

const router = Router();

// GET /api/jobs – Fetch recommended jobs using stored credentials
router.get('/', async (_req, res, next) => {
  try {
    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({
        error: 'Credenciais ausentes. Use a extensão para sincronizar suas credenciais do LinkedIn.',
      });
      return;
    }

    const linkedInService = new LinkedInService(creds.cookie, creds.csrf);
    const jobs = await linkedInService.fetchJobs();

    res.json({ jobs, source: 'linkedin' });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id – Fetch job details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes. Use a extensão para sincronizar.' });
      return;
    }

    const linkedInService = new LinkedInService(creds.cookie, creds.csrf);
    const jobDetail = await linkedInService.fetchJobDetail(id);

    res.json({
      id:               jobDetail.id,
      title:            jobDetail.title,
      description:      jobDetail.description || '',
      location:         jobDetail.location || '',
      url:              jobDetail.url || `https://www.linkedin.com/jobs/view/${jobDetail.id}`,
      employmentStatus: jobDetail.employmentStatus || 'FULL_TIME',
      companyName:      jobDetail.companyName || '',
      companyInfo:      jobDetail.companyName || '',
      companyLogo:      jobDetail.companyLogo || undefined,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id/apply-form – Fetch Easy Apply form structure
router.get('/:id/apply-form', async (req, res, next) => {
  try {
    const { id } = req.params;

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes.' });
      return;
    }

    const linkedInService = new LinkedInService(creds.cookie, creds.csrf);
    const form = await linkedInService.fetchApplyForm(id);
    res.json(form);
  } catch (error) {
    next(error);
  }
});

export default router;
