import { Router } from 'express';
import { credentialsService } from '../services/credentialsService';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';

const router = Router();

// GET /api/config - Check connection status / credentials
router.get('/', async (req, res, next) => {
  try {
    const creds = await credentialsService.getLatest();
    const importedJobs = await jobService.getAll();
    res.json({
      hasCredentials: !!creds,
      hasImportedJobs: importedJobs.length > 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
