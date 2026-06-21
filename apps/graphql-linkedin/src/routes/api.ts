import { Router } from 'express';
import { linkedinAuthMiddleware } from '../middlewares/auth';
import * as linkedinController from '../controllers/linkedinController';

export const apiRouter = Router();

apiRouter.use(linkedinAuthMiddleware);

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     summary: List easy-apply jobs
 *     description: Retrieves easy-apply jobs matching the keywords and filters.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.get('/jobs', linkedinController.getJobs);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     summary: Retrieve job details
 *     description: Gets detailed information for a specific job posting.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.get('/jobs/:id', linkedinController.getJobDetail);

/**
 * @openapi
 * /api/jobs/{id}/apply-form:
 *   get:
 *     summary: Retrieve job application form
 *     description: Fetches the multi-step form questions for a LinkedIn Easy Apply job.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.get('/jobs/:id/apply-form', linkedinController.getApplyForm);

/**
 * @openapi
 * /api/jobs/{id}/apply:
 *   post:
 *     summary: Submit application form
 *     description: Submits Easy Apply form answers and file uploads for a job posting.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.post('/jobs/:id/apply', linkedinController.submitApplication);

/**
 * @openapi
 * /api/posts:
 *   post:
 *     summary: Create a post on LinkedIn
 *     description: Publishes a text post (with optional media or documents) to LinkedIn.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.post('/posts', linkedinController.createPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a specific post by its LinkedIn sharing ID.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.delete('/posts/:id', linkedinController.deletePost);

/**
 * @openapi
 * /api/profile/info:
 *   get:
 *     summary: Retrieve profile info
 *     description: Fetches full profile info including bio, experiences, and education parsed from the user's PDF profile.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
 *     responses:
 *       200:
 *         description: Successfully fetched profile info
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRouter.get('/profile/info', linkedinController.getProfileInfo);

/**
 * @openapi
 * /api/profile/resume-pdf:
 *   get:
 *     summary: Retrieve resume PDF
 *     description: Downloads the user's profile PDF from LinkedIn and returns parsed text along with a base64-encoded PDF.
 *     security:
 *       - LinkedInCookie: []
 *         LinkedInCsrf: []
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
apiRouter.get('/profile/resume-pdf', linkedinController.getResumePdf);
