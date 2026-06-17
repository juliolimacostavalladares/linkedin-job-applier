import { Router } from 'express';
import prisma from '../lib/prisma';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { resumeService } from '../services/resumeService';
import { aiService } from '../services/aiService';
import { applicationService } from '../services/applicationService';
import { logger } from '../utils/logger';
import type { Job, JobDetail, ApplyForm } from '../types';

const router = Router();

function getProgrammaticFallbackQuery(headline?: string | null): string {
  if (!headline) return 'React';
  const lower = headline.toLowerCase();
  
  let seniority = '';
  if (lower.includes('senior') || lower.includes('sênior')) {
    seniority = '(senior OR sênior)';
  } else if (lower.includes('pleno') || lower.includes('mid')) {
    seniority = 'pleno';
  } else if (lower.includes('junior') || lower.includes('júnior')) {
    seniority = 'júnior';
  }

  let roles = '';
  if (lower.includes('front-end') || lower.includes('frontend') || lower.includes('front end')) {
    roles = '("Front-end" OR "Frontend" OR "Desenvolvedor Front-end")';
  } else if (lower.includes('back-end') || lower.includes('backend') || lower.includes('back end')) {
    roles = '("Back-end" OR "Backend" OR "Desenvolvedor Backend")';
  } else if (lower.includes('fullstack') || lower.includes('full stack')) {
    roles = '("Fullstack" OR "Full Stack" OR "Desenvolvedor Fullstack")';
  } else {
    roles = '("Desenvolvedor" OR "Programador")';
  }

  const skills: string[] = [];
  if (lower.includes('react')) skills.push('React');
  if (lower.includes('next.js') || lower.includes('nextjs')) skills.push('Next.js');
  if (lower.includes('typescript')) skills.push('TypeScript');
  if (lower.includes('vue')) skills.push('Vue');
  if (lower.includes('angular')) skills.push('Angular');
  if (lower.includes('node')) skills.push('Node.js');
  if (lower.includes('java')) skills.push('Java');
  if (lower.includes('python')) skills.push('Python');

  const skillsGroup = skills.length > 0 ? ` AND (${skills.join(' OR ')})` : '';
  return `${seniority ? seniority + ' ' : ''}${roles}${skillsGroup}`.trim();
}

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

    const rawQuery = typeof q === 'string' ? q.trim() : '';
    let activeQuery = rawQuery;

    if (!rawQuery) {
      // By default, build the query from the resume profile using AI
      const latestResume = await resumeService.getLatest();
      if (latestResume) {
        let cached = latestResume.searchQuery;
        if (!cached) {
          logger.info('Generating job search query from resume using 9Router...');
          try {
            cached = await aiService.generateSearchQuery(latestResume.text);
            await prisma.resume.update({
              where: { id: latestResume.id },
              data: { searchQuery: cached },
            });
          } catch (err) {
            logger.error('Failed to generate search query using AI, using fallback', err);
            cached = getProgrammaticFallbackQuery(latestResume.headline);
            await prisma.resume.update({
              where: { id: latestResume.id },
              data: { searchQuery: cached },
            });
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
          applied
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

    const enrichedJobs = (data.jobs || []).map((job) => {
      const isApplied = job.applied || appliedSet.has(job.id);

      if (job.applied && !appliedSet.has(job.id)) {
        applicationService.save(job.id, {}, 'applied', {
          jobTitle: job.title,
          companyName: job.companyInfo,
          companyLogo: job.companyLogo,
          jobUrl: `https://www.linkedin.com/jobs/view/${job.id}`,
        }).catch(err => {
          logger.error('Failed to auto-sync applied status from search list:', err);
        });
      }

      return {
        ...job,
        applied: isApplied,
      };
    });

    res.json({
      jobs: enrichedJobs,
      searchQuery: rawQuery,
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
          appliedOnLinkedIn
          viewedByJobPosterAt
          closed
        }
      }
    `;

    const formQuery = `
      query GetApplyForm($id: ID!, $cookie: String!, $csrf: String!, $headersJson: String) {
        applyForm(id: $id, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          message
          referenceId
          resumeUploadFormElementUrn
          resumeUrns
          steps {
            title
            questions {
              urn
              required
              title
              type
              options
              optionUrns
              optionEnumStrings
            }
          }
          questions {
            urn
            required
            title
            type
            options
            optionUrns
            optionEnumStrings
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
    let applicationStatus = 'applied';

    if (appDbRes.status === 'fulfilled' && appDbRes.value && appDbRes.value.length > 0) {
      const activeApp = appDbRes.value.find((app) => ['applied', 'viewed', 'closed'].includes(app.status));
      if (activeApp) {
        applied = true;
        appliedAt = activeApp.createdAt.toISOString();
        applicationStatus = activeApp.status;
      }
    }

    if (jobDetail.appliedOnLinkedIn) {
      applied = true;
      let targetStatus = jobDetail.viewedByJobPosterAt ? 'viewed' : 'applied';
      if (jobDetail.closed) {
        targetStatus = 'closed';
      }
      
      if (!appliedAt) {
        const app = await applicationService.save(id, {}, targetStatus, {
          jobTitle: jobDetail.title,
          companyName: jobDetail.companyName,
          companyLogo: jobDetail.companyLogo,
          jobUrl: jobDetail.url,
        });
        appliedAt = app.createdAt.toISOString();
        applicationStatus = targetStatus;
      } else if (applicationStatus !== targetStatus) {
        await applicationService.updateStatus(id, targetStatus);
        applicationStatus = targetStatus;
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
      applicationStatus,
      viewedByJobPosterAt: jobDetail.viewedByJobPosterAt,
      closed: jobDetail.closed || false,
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
          referenceId
          resumeUploadFormElementUrn
          resumeUrns
          steps {
            title
            questions {
              urn
              required
              title
              type
              options
              optionUrns
              optionEnumStrings
            }
          }
          questions {
            urn
            required
            title
            type
            options
            optionUrns
            optionEnumStrings
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

// POST /api/jobs/:id/apply – Submit Easy Apply form to LinkedIn, then save locally
router.post('/:id/apply', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      answers,
      jobTitle,
      companyName,
      companyLogo,
      jobUrl,
      // Pre-typed payload from the frontend (preferred)
      formResponses,
      referenceId: bodyReferenceId,
      fileUploadResponses,
      // Shortcut resume fields (can come from the frontend after fetching apply-form)
      resumeUrn: bodyResumeUrn,
      resumeUploadFormElementUrn: bodyResumeFormElementUrn,
    } = req.body as {
      answers?: Record<string, string>;
      jobTitle?: string;
      companyName?: string;
      companyLogo?: string;
      jobUrl?: string;
      formResponses?: unknown[];
      referenceId?: string;
      fileUploadResponses?: unknown[];
      resumeUrn?: string;
      resumeUploadFormElementUrn?: string;
    };

    // Get credentials to call LinkedIn API
    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes. Use a extensão para sincronizar.' });
      return;
    }

    // ── Resolve referenceId, resumeUrn, resumeUploadFormElementUrn ──────────────
    // If not provided by the caller, fetch the apply form to capture them.
    let referenceId = bodyReferenceId;
    let resumeUrn = bodyResumeUrn;
    let resumeUploadFormElementUrn = bodyResumeFormElementUrn;

    const needsFormFetch = !referenceId || !resumeUrn || !resumeUploadFormElementUrn;
    if (needsFormFetch) {
      try {
        const formQuery = `
          query GetApplyForm($id: ID!, $cookie: String!, $csrf: String!, $headersJson: String) {
            applyForm(id: $id, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
              success
              referenceId
              resumeUploadFormElementUrn
              resumeUrns
            }
          }
        `;
        const formData = await queryGraphQL<{ applyForm: { success: boolean; referenceId?: string; resumeUploadFormElementUrn?: string; resumeUrns?: string[] } }>(formQuery, {
          id,
          cookie: creds.cookie,
          csrf: creds.csrf,
          headersJson: creds.headersJson,
        });
        const form = formData.applyForm;
        if (!referenceId) referenceId = form?.referenceId;
        if (!resumeUploadFormElementUrn) resumeUploadFormElementUrn = form?.resumeUploadFormElementUrn;
        // Pick the most-recently-used resume (already sorted desc by parser)
        if (!resumeUrn && form?.resumeUrns && form.resumeUrns.length > 0) {
          resumeUrn = form.resumeUrns[0];
        }
        logger.info(
          `[apply] From GET apply-form — referenceId: ${referenceId ?? '(missing)'}, ` +
          `resumeUrn: ${resumeUrn ?? '(missing)'}, resumeFormEl: ${resumeUploadFormElementUrn ?? '(missing)'}`,
        );
      } catch (err) {
        logger.warn('[apply] Failed to fetch apply-form context, proceeding without it', err);
      }
    }

    // ── Build mutation variables ───────────────────────────────────────────────
    const submitMutation = `
      mutation SubmitApplication(
        $id: ID!
        $formValues: String!
        $cookie: String!
        $csrf: String!
        $headersJson: String
        $formResponsesJson: String
        $referenceId: String
        $fileUploadResponsesJson: String
        $resumeUrn: String
        $resumeUploadFormElementUrn: String
      ) {
        submitApplication(
          id: $id
          formValues: $formValues
          cookie: $cookie
          csrf: $csrf
          headersJson: $headersJson
          formResponsesJson: $formResponsesJson
          referenceId: $referenceId
          fileUploadResponsesJson: $fileUploadResponsesJson
          resumeUrn: $resumeUrn
          resumeUploadFormElementUrn: $resumeUploadFormElementUrn
        ) {
          success
          message
        }
      }
    `;

    const variables: Record<string, string | null | undefined> = {
      id,
      formValues: JSON.stringify(answers || {}),
      cookie: creds.cookie,
      csrf: creds.csrf,
      headersJson: creds.headersJson,
      referenceId,
      resumeUrn,
      resumeUploadFormElementUrn,
    };

    if (formResponses && formResponses.length > 0) {
      variables['formResponsesJson'] = JSON.stringify(formResponses);
    }
    if (fileUploadResponses && fileUploadResponses.length > 0) {
      variables['fileUploadResponsesJson'] = JSON.stringify(fileUploadResponses);
    }


    const linkedInResult = await queryGraphQL<{ submitApplication: { success: boolean; message?: string } }>(
      submitMutation,
      variables,
    );

    // 2. If LinkedIn submission failed, return error without saving locally
    if (!linkedInResult.submitApplication.success) {
      res.status(400).json({
        success: false,
        message: linkedInResult.submitApplication.message || 'Erro ao enviar candidatura para o LinkedIn',
      });
      return;
    }

    // 3. Only if LinkedIn accepted, save locally
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
