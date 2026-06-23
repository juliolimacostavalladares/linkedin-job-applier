import { Router } from 'express';
import { applicationService, isAppliedThroughSystem } from '../services/applicationService';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = Router();

// GET /api/applications – List all job applications
/**
 * @openapi
 * /api/applications:
 *   get:
 *     tags:
 *       - Applications
 *     operationId: listJobApplications
 *     summary: List job applications
 *     description: Returns a list of all job application records stored in SQLite, detailing status, job URN, company details, and timestamps.
 *     responses:
 *       200:
 *         description: Applications list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   jobId:
 *                     type: string
 *                   status:
 *                     type: string
 *                     example: "applied"
 *                   jobTitle:
 *                     type: string
 *                   companyName:
 *                     type: string
 *                   appliedThroughSystem:
 *                     type: boolean
 */
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
/**
 * @openapi
 * /api/applications/sync:
 *   post:
 *     tags:
 *       - Applications
 *     operationId: syncApplicationsWithLinkedin
 *     summary: Sync applications with LinkedIn
 *     description: Iterates through stored local applications, queries LinkedIn's API for their active status, updates them to closed or viewed, and cleans up old applications.
 *     responses:
 *       200:
 *         description: Applications successfully synchronized with LinkedIn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sincronização concluída..."
 *       401:
 *         description: Missing credentials
 */
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
/**
 * @openapi
 * /api/applications/{id}/resume.pdf:
 *   get:
 *     tags:
 *       - Applications
 *     operationId: downloadApplicationResumePdf
 *     summary: Download application resume PDF
 *     description: Streams the binary PDF data of the optimized resume associated with a specific job application.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique job application ID.
 *     responses:
 *       200:
 *         description: Resume PDF binary streamed successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Application or PDF file not found
 */
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
