import { Router } from 'express';
import * as jobsController from '../controllers/jobsController';

export const jobsRouter = Router();

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs
 *     operationId: listJobs
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
jobsRouter.get('/', jobsController.getJobs);

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags:
 *       - Jobs
 *     operationId: getJobDetail
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
jobsRouter.get('/:id', jobsController.getJobDetail);

/**
 * @openapi
 * /api/jobs/{id}/apply-form:
 *   get:
 *     tags:
 *       - Jobs
 *     operationId: getApplyForm
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
jobsRouter.get('/:id/apply-form', jobsController.getApplyForm);

/**
 * @openapi
 * /api/jobs/{id}/apply:
 *   post:
 *     tags:
 *       - Jobs
 *     operationId: submitApplication
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
jobsRouter.post('/:id/apply', jobsController.submitApplication);
