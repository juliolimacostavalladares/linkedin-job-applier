import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';

const router = Router();

// GET /api/config - Check connection status / credentials
/**
 * @openapi
 * /api/config:
 *   get:
 *     tags:
 *       - Config
 *     operationId: retrieveConfigurationStatus
 *     summary: Retrieve configuration status
 *     description: Checks if the backend has valid session credentials and imported jobs.
 *     responses:
 *       200:
 *         description: Configuration status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasCredentials:
 *                   type: boolean
 *                   example: true
 *                 hasImportedJobs:
 *                   type: boolean
 *                   example: false
 */
router.get('/', async (req, res, next) => {
  try {
    const creds = await credentialsService.getLatest();
    res.json({
      hasCredentials: !!creds,
      hasImportedJobs: false,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
