import { Router } from 'express';
import { applicationService } from '../services/applicationService';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/applications – List all job applications
router.get('/', async (req, res, next) => {
  try {
    const applications = await applicationService.listAll();
    res.json(applications);
  } catch (error) {
    logger.error('Failed to list applications', error);
    next(error);
  }
});

// POST /api/applications/sync – Sync applications with LinkedIn API
router.post('/sync', async (req, res, next) => {
  try {
    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      res.status(401).json({ error: 'Credenciais ausentes. Use a extensão para sincronizar.' });
      return;
    }

    // Get all local applications
    const localApplications = await applicationService.listAll();
    
    const results = {
      total: localApplications.length,
      synced: 0,
      removed: 0,
      updated: 0,
      errors: [] as { jobId: string; error: string }[],
    };

    // GraphQL query to check job detail (includes appliedOnLinkedIn status)
    const detailQuery = `
      query GetJobDetail($id: ID!, $cookie: String!, $csrf: String!, $headersJson: String) {
        jobDetail(id: $id, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          id
          appliedOnLinkedIn
          viewedByJobPosterAt
          closed
        }
      }
    `;

    // Check each application against LinkedIn
    for (const app of localApplications) {
      try {
        const data = await queryGraphQL<{ jobDetail: any }>(detailQuery, {
          id: app.jobId,
          cookie: creds.cookie,
          csrf: creds.csrf,
          headersJson: creds.headersJson,
        });

        const { appliedOnLinkedIn, viewedByJobPosterAt, closed } = data.jobDetail;

        // If not applied on LinkedIn, remove from local DB
        if (!appliedOnLinkedIn) {
          await applicationService.deleteByJobId(app.jobId);
          results.removed++;
          logger.info(`Removed application ${app.jobId} - not applied on LinkedIn`);
          continue;
        }

        // Determine correct status based on LinkedIn data
        let correctStatus = 'applied';
        if (closed) {
          correctStatus = 'closed';
        } else if (viewedByJobPosterAt) {
          correctStatus = 'viewed';
        }

        // Update if status is different
        if (app.status !== correctStatus) {
          await applicationService.updateStatus(app.jobId, correctStatus);
          results.updated++;
          logger.info(`Updated application ${app.jobId}: ${app.status} → ${correctStatus}`);
        }

        results.synced++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({ jobId: app.jobId, error: errorMsg });
        logger.error(`Failed to sync application ${app.jobId}`, error);
      }
    }

    res.json({
      success: true,
      message: `Sincronização concluída: ${results.synced} verificadas, ${results.updated} atualizadas, ${results.removed} removidas`,
      results,
    });
  } catch (error) {
    logger.error('Failed to sync applications', error);
    next(error);
  }
});

export default router;
