import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
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

    res.json({ jobs: data.jobs, source: 'linkedin-graphql' });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id – Fetch job details via LinkedIn GraphQL Service
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes. Use a extensão para sincronizar.' });
      return;
    }

    const query = `
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

    const data = await queryGraphQL<{ jobDetail: JobDetail }>(query, {
      id,
      cookie: creds.cookie,
      csrf: creds.csrf,
      headersJson: creds.headersJson,
    });

    const { jobDetail } = data;

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

export default router;
