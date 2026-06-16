import { Router } from 'express';
import { LinkedInService } from '../services/linkedinService';
import { jobService } from '../services/jobService';
import { credentialsService } from '../services/credentialsService';
import { logger } from '../utils/logger';

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

    // Persist / update jobs in the database
    await jobService.saveFromLinkedIn(jobs);

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

    // Use any logo/company already cached in the database
    const savedJob = await jobService.getByLinkedinId(id);

    const linkedInService = new LinkedInService(creds.cookie, creds.csrf);
    const jobDetail = await linkedInService.fetchJobDetail(id);
    await jobService.saveJobDetail(jobDetail);

    res.json({
      id:               jobDetail.id,
      title:            jobDetail.title,
      description:      jobDetail.description || '',
      location:         jobDetail.location || '',
      url:              jobDetail.url || `https://www.linkedin.com/jobs/view/${jobDetail.id}`,
      employmentStatus: jobDetail.employmentStatus || 'FULL_TIME',
      companyName:      savedJob?.companyInfo || jobDetail.companyName || '',
      companyInfo:      savedJob?.companyInfo || jobDetail.companyName || '',
      companyLogo:      savedJob?.companyLogo || jobDetail.companyLogo || undefined,
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
