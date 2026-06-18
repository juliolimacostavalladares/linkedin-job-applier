import { Router } from 'express';
import { applicationService, isAppliedThroughSystem } from '../services/applicationService';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

// GET /api/applications – List all job applications
router.get('/', async (req, res, next) => {
  try {
    const applications = await applicationService.listAll();
    const enriched = applications.map((app) => ({
      ...app,
      appliedThroughSystem: isAppliedThroughSystem(app),
    }));
    res.json(enriched);
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

    interface SyncJobDetail {
      id: string;
      appliedOnLinkedIn: boolean;
      viewedByJobPosterAt: string | null;
      closed: boolean;
    }

    // Check each application against LinkedIn
    for (const app of localApplications) {
      try {
        const data = await queryGraphQL<{ jobDetail: SyncJobDetail }>(detailQuery, {
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

// GET /api/applications/:id/resume.pdf – Stream the optimized resume PDF
router.get('/:id/resume.pdf', async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await applicationService.findById(id);
    
    if (!application) {
      res.status(404).json({ error: 'Candidatura não encontrada.' });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    // Set disposition to inline so it displays inside browser/iframe rather than downloading
    const rawFilename = application.resumePdfPath 
      ? path.basename(application.resumePdfPath)
      : (application.jobTitle ? `${application.jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf` : 'optimized_resume.pdf');
    res.setHeader('Content-Disposition', `inline; filename="${rawFilename}"`);

    // 1. Prefer database base64 field
    if (application.resumePdfBase64) {
      const pdfBuffer = Buffer.from(application.resumePdfBase64, 'base64');
      res.send(pdfBuffer);
      return;
    }

    // 2. Fallback to file path on disk
    if (application.resumePdfPath) {
      const fullPdfPath = path.isAbsolute(application.resumePdfPath) 
        ? application.resumePdfPath 
        : path.join(process.cwd(), application.resumePdfPath);

      if (fs.existsSync(fullPdfPath)) {
        const stream = fs.createReadStream(fullPdfPath);
        stream.pipe(res);
        return;
      }
    }

    res.status(404).json({ error: 'Currículo PDF não encontrado para esta candidatura.' });
  } catch (error) {
    logger.error('Failed to download resume PDF', error);
    next(error);
  }
});

export default router;
