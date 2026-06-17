import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { resumeService } from '../services/resumeService';
import { aiService } from '../services/aiService';
import { applicationService } from '../services/applicationService';
import { logger } from '../utils/logger';
import type { Job, JobDetail, ApplyForm } from '../types';

const router = Router();
const queryCache = new Map<string, string>();

// GET /api/jobs – Fetch recommended jobs using stored credentials via LinkedIn GraphQL Service
router.get('/', async (req, res, next) => {
  try {
    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({
        error: 'Credenciais ausentes. Use a extensão para sincronizar suas credenciais do LinkedIn.',
      });
      return;
    }

    const { q, remote, past24h } = req.query;
    const isRemote = remote !== 'false';
    const isPast24h = past24h !== 'false';

    let activeQuery = typeof q === 'string' ? q : '';

    if (!q) {
      // By default, build the query from the resume profile using AI
      const latestResume = await resumeService.getLatest();
      if (latestResume) {
        const cacheKey = `${latestResume.id}-${latestResume.updatedAt.getTime()}`;
        let cached = queryCache.get(cacheKey);
        if (!cached) {
          logger.info('Generating job search query from resume using Gemini AI...');
          try {
            cached = await aiService.generateSearchQuery(latestResume.text);
            queryCache.set(cacheKey, cached);
          } catch (err) {
            logger.error('Failed to generate search query using AI, using fallback', err);
            cached = '';
          }
        }
        activeQuery = cached || '';
      }
    }

    const query = `
      query GetJobs($cookie: String!, $csrf: String!, $headersJson: String, $keywords: String, $remote: Boolean, $past24h: Boolean) {
        jobs(cookie: $cookie, csrf: $csrf, headersJson: $headersJson, keywords: $keywords, remote: $remote, past24h: $past24h) {
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
      keywords: activeQuery || null,
      remote: isRemote,
      past24h: isPast24h,
    });

    const appliedIds = await applicationService.listAppliedJobIds();
    const appliedSet = new Set(appliedIds);

    const enrichedJobs = (data.jobs || []).map((job) => ({
      ...job,
      applied: appliedSet.has(job.id),
    }));

    res.json({
      jobs: enrichedJobs,
      searchQuery: activeQuery,
      filters: {
        remote: isRemote,
        past24h: isPast24h,
      },
      source: 'linkedin-graphql',
    });
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
