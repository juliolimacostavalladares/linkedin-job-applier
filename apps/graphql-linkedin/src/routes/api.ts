import { Router, Response, NextFunction } from 'express';
import { LinkedInRequest } from '../types/express';
import { LinkedInService } from '../services/linkedinService';
import { linkedinAuthMiddleware } from '../middlewares/auth';
import { logger } from '../utils/logger';
import { redactSensitiveData } from '../utils/security';

export const apiRouter = Router();

apiRouter.use(linkedinAuthMiddleware);

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: List easy-apply jobs
 *     description: Retrieves easy-apply jobs matching the keywords and filters.
 *     security:
 *       - LinkedInAuth: []
 *     parameters:
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *         description: Keyword filter (e.g. "React")
 *       - in: query
 *         name: remote
 *         schema:
 *           type: boolean
 *         description: Filter for remote positions
 *       - in: query
 *         name: past24h
 *         schema:
 *           type: boolean
 *         description: Filter for jobs posted in the past 24h
 *     responses:
 *       200:
 *         description: Successfully fetched jobs list
 *       401:
 *         description: Unauthorized / invalid credentials
 *       500:
 *         description: Internal server error
 */
apiRouter.get('/jobs', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const { keywords, remote, past24h } = req.query;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const jobs = await svc.fetchJobs(
      typeof keywords === 'string' ? keywords : null,
      remote === 'true',
      past24h === 'true'
    );

    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Retrieve job details
 *     description: Gets detailed information for a specific job posting.
 *     security:
 *       - LinkedInAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LinkedIn job posting ID
 *     responses:
 *       200:
 *         description: Successfully fetched job details
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.get('/jobs/:id', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const jobId = req.params.id;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const jobDetail = await svc.fetchJobDetail(jobId);

    res.json(jobDetail);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/jobs/{id}/apply-form:
 *   get:
 *     summary: Retrieve job application form
 *     description: Fetches the multi-step form questions for a LinkedIn Easy Apply job.
 *     security:
 *       - LinkedInAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LinkedIn job posting ID
 *     responses:
 *       200:
 *         description: Form successfully retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.get('/jobs/:id/apply-form', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const jobId = req.params.id;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const applyForm = await svc.fetchApplyForm(jobId);

    res.json(applyForm);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/jobs/{id}/apply:
 *   post:
 *     summary: Submit application form
 *     description: Submits Easy Apply form answers and file uploads for a job posting.
 *     security:
 *       - LinkedInAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LinkedIn job posting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - formValues
 *             properties:
 *               formValues:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Flat map of URN to string answer value
 *               formResponses:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Explicit structured responses (optional)
 *               referenceId:
 *                 type: string
 *                 description: Form reference ID from the GET form endpoint
 *               fileUploadResponses:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Explicit file upload entries (optional)
 *               resumeUrn:
 *                 type: string
 *                 description: URN of the uploaded resume (optional shortcut)
 *               resumeUploadFormElementUrn:
 *                 type: string
 *                 description: URN of the resume form element (optional shortcut)
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.post('/jobs/:id/apply', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const jobId = req.params.id;
    const {
      formValues,
      formResponses,
      referenceId,
      fileUploadResponses,
      resumeUrn,
      resumeUploadFormElementUrn,
    } = req.body;

    if (!formValues || typeof formValues !== 'object') {
      res.status(400).json({ error: 'Bad Request', message: 'formValues object is required' });
      return;
    }

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);

    let finalFileUploads = fileUploadResponses;
    if (!finalFileUploads && resumeUrn && resumeUploadFormElementUrn) {
      finalFileUploads = [{
        inputUrn: resumeUrn,
        formElementUrn: resumeUploadFormElementUrn,
      }];
    }

    const result = await svc.submitApplyForm(jobId, formValues, {
      formResponses,
      referenceId,
      fileUploadResponses: finalFileUploads,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/posts:
 *   post:
 *     summary: Create a post on LinkedIn
 *     description: Publishes a text post (with optional media or documents) to LinkedIn.
 *     security:
 *       - LinkedInAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Main text content of the post
 *               mediaUrn:
 *                 type: string
 *                 description: URN of image or article media (optional)
 *               mediaCategory:
 *                 type: string
 *                 enum: [IMAGE, DOCUMENT, ARTICLE]
 *                 description: Category type of the media (optional)
 *               documentSharingTitle:
 *                 type: string
 *                 description: Title of shared document (optional)
 *     responses:
 *       200:
 *         description: Post published successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.post('/posts', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const { text, mediaUrn, mediaCategory, documentSharingTitle } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'text field is required and must be a string' });
      return;
    }

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const result = await svc.createPost(
      text,
      mediaUrn,
      mediaCategory,
      documentSharingTitle
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a specific post by its LinkedIn sharing ID.
 *     security:
 *       - LinkedInAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LinkedIn post sharing ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.delete('/posts/:id', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const postId = req.params.id;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const result = await svc.deletePost(postId);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/profile/info:
 *   get:
 *     summary: Retrieve profile info
 *     description: Fetches full profile info including bio, experiences, and education parsed from the user's PDF profile.
 *     security:
 *       - LinkedInAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched profile info
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.get('/profile/info', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const profileInfo = await svc.fetchProfileInfo();

    res.json(profileInfo);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/profile/resume-pdf:
 *   get:
 *     summary: Retrieve resume PDF
 *     description: Downloads the user's profile PDF from LinkedIn and returns parsed text along with a base64-encoded PDF.
 *     security:
 *       - LinkedInAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: LinkedIn profile/member URN ID
 *     responses:
 *       200:
 *         description: PDF downloaded and parsed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.get('/profile/resume-pdf', async (req: LinkedInRequest, res: Response, next: NextFunction) => {
  try {
    const creds = req.linkedinCredentials!;
    const { profileId } = req.query;

    if (!profileId || typeof profileId !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'profileId query parameter is required' });
      return;
    }

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const pdfBuffer = await svc.fetchResumePdf(profileId);
    
    // Lazy load pdf-parse dynamically to optimize imports
    const pdfParse = (await import('pdf-parse')).default;
    const nodeBuffer = Buffer.from(pdfBuffer);
    const parsed = await pdfParse(nodeBuffer);

    res.json({
      success: true,
      text: parsed.text,
      pdfBase64: nodeBuffer.toString('base64'),
    });
  } catch (err) {
    next(err);
  }
});
