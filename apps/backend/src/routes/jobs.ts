import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { resumeService } from '../services/resumeService';
import { AIService } from '../services/aiService';
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

    res.json({ jobs: data.jobs, source: 'linkedin-graphql' });
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

    const [detailRes, formRes] = await Promise.allSettled([
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
      })
    ]);

    if (detailRes.status === 'rejected') {
      throw detailRes.reason;
    }

    const { jobDetail } = detailRes.value;
    let applyForm: ApplyForm | undefined;

    if (formRes.status === 'fulfilled' && formRes.value.applyForm) {
      applyForm = formRes.value.applyForm;

      // If form exists and has questions, try to pre-fill it with AI using user's latest resume
      if (applyForm.success && applyForm.questions && applyForm.questions.length > 0) {
        try {
          const latestResume = await resumeService.getLatest();
          if (latestResume && latestResume.text && latestResume.text.trim()) {
            const aiService = new AIService();
            const aiRes = await aiService.generateAnswers(applyForm.questions, latestResume.text);
            
            const answerMap = new Map<string, string>();
            if (aiRes && aiRes.answers) {
              aiRes.answers.forEach((ans) => {
                if (ans.urn && ans.answer) {
                  answerMap.set(ans.urn, ans.answer);
                }
              });
            }

            // Map suggestions back to questions
            applyForm.questions = applyForm.questions.map((q) => ({
              ...q,
              suggestedAnswer: answerMap.get(q.urn) || undefined,
            }));

            if (applyForm.steps) {
              applyForm.steps = applyForm.steps.map((step) => ({
                ...step,
                questions: step.questions.map((q) => ({
                  ...q,
                  suggestedAnswer: answerMap.get(q.urn) || undefined,
                })),
              }));
            }
            logger.info(`Successfully pre-filled apply form with AI suggestions for job ${id}`);
          }
        } catch (aiErr) {
          logger.error(`Failed to pre-fill apply form with AI for job ${id}:`, aiErr);
        }
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
