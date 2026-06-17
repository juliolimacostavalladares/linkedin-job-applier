import { Router } from 'express';
import { applicationService } from '../services/applicationService';
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

export default router;
