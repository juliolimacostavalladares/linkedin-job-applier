import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { resumeService } from '../services/resumeService';
import { AIService } from '../services/aiService';
import { applicationService } from '../services/applicationService';
import { logger } from '../utils/logger';
import type { Job, JobDetail, ApplyForm } from '../types';

const router = Router();

// GET /api/jobs – Fetch recommended jobs using stored credentials via LinkedIn GraphQL Service
router.get('/', async (_req, res, next) => {
  try {
    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({
        error: 'Credenciais ausentes. Use a extensão para sincronizar suas credenciais do LinkedIn.',
      });
      return;
    }

    const query = `
      query GetJobs($cookie: String!, $csrf: String!, $headersJson: String) {
        jobs(cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          id
          title
          companyInfo
          companyLogo
        }
      }
    `;

    const data = await queryGraphQL<{ jobs: Job[] }>(query, {
      cookie: creds.cookie,
      csrf: creds.csrf,
      headersJson: creds.headersJson,
    });

    const appliedIds = await applicationService.listAppliedJobIds();
    const appliedSet = new Set(appliedIds);

    const enrichedJobs = (data.jobs || []).map((job) => ({
      ...job,
      applied: appliedSet.has(job.id),
    }));

    res.json({ jobs: enrichedJobs, source: 'linkedin-graphql' });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id – Fetch job details and optional Easy Apply form via LinkedIn GraphQL Service
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes. Use a extensão para sincronizar.' });
      return;
    }

    const detailQuery = `
      query GetJobDetail($id: ID!, $cookie: String!, $csrf: String!, $headersJson: String) {
        jobDetail(id: $id, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          id
          title
          description
          location
          url
          employmentStatus
          companyName
          companyLogo
        }
      }
    `;

    const formQuery = `
      query GetApplyForm($id: ID!, $cookie: String!, $csrf: String!, $headersJson: String) {
        applyForm(id: $id, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          message
          steps {
            title
            questions {
              urn
              required
              title
              type
              options
            }
          }
          questions {
            urn
            required
            title
            type
            options
          }
        }
      }
    `;

    const [detailRes, formRes, appDbRes] = await Promise.allSettled([
      queryGraphQL<{ jobDetail: JobDetail }>(detailQuery, {
        id,
        cookie: creds.cookie,
        csrf: creds.csrf,
        headersJson: creds.headersJson,
      }),
      queryGraphQL<{ applyForm: ApplyForm }>(formQuery, {
        id,
        cookie: creds.cookie,
        csrf: creds.csrf,
        headersJson: creds.headersJson,
      }),
      applicationService.listByJob(id)
    ]);

    if (detailRes.status === 'rejected') {
      throw detailRes.reason;
    }

    const { jobDetail } = detailRes.value;
    let applyForm: ApplyForm | undefined;

    if (formRes.status === 'fulfilled' && formRes.value.applyForm) {
      applyForm = formRes.value.applyForm;
    }

    let applied = false;
    let appliedAt: string | undefined;

    if (appDbRes.status === 'fulfilled' && appDbRes.value && appDbRes.value.length > 0) {
      const activeApp = appDbRes.value.find((app) => app.status === 'applied');
      if (activeApp) {
        applied = true;
        appliedAt = activeApp.createdAt.toISOString();
      }
    }

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
      applyForm,
      applied,
      appliedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id/apply-form – Fetch Easy Apply form structure via LinkedIn GraphQL Service
router.get('/:id/apply-form', async (req, res, next) => {
  try {
    const { id } = req.params;

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes.' });
      return;
    }

    const query = `
      query GetApplyForm($id: ID!, $cookie: String!, $csrf: String!, $headersJson: String) {
        applyForm(id: $id, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          message
          steps {
            title
            questions {
              urn
              required
              title
              type
              options
            }
          }
          questions {
            urn
            required
            title
            type
            options
          }
        }
      }
    `;

    const data = await queryGraphQL<{ applyForm: ApplyForm }>(query, {
      id,
      cookie: creds.cookie,
      csrf: creds.csrf,
      headersJson: creds.headersJson,
    });

    res.json(data.applyForm);
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/apply – Submit Easy Apply form (locally and update status)
router.post('/:id/apply', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, jobTitle, companyName, companyLogo, jobUrl } = req.body;

    const application = await applicationService.save(id, answers || {}, 'applied', {
      jobTitle,
      companyName,
      companyLogo,
      jobUrl,
    });

    res.json({
      success: true,
      message: 'Candidatura finalizada com sucesso!',
      application,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
