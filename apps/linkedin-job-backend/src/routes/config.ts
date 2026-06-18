import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';

const router = Router();

// GET /api/config - Check connection status / credentials
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
