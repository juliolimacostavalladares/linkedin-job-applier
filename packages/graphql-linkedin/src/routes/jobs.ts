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
 *     description: |
 *       Retrieves a list of easy-apply jobs from LinkedIn matching the keywords and filters.
 *
 *       ### Query Parameters
 *       - `keywords` (string, optional): Job title or skill keywords (e.g. `React`, `Node.js`).
 *       - `remote` (boolean, optional): If `true`, filters for remote positions.
 *       - `past24h` (boolean, optional): If `true`, restricts search results to jobs posted in the past 24 hours.
 *
 *       > [!TIP]
 *       > For better performance and search precision, always specify `keywords`.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
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
 *     description: |
 *       Gets detailed information for a specific LinkedIn job posting by its unique job ID.
 *
 *       ### Path Parameters
 *       - `id` (string, required): The unique LinkedIn job posting ID.
 *
 *       ### Response Content
 *       Returns the job title, company name, location, and the full description text of the job, which is parsed to extract key requirements.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobDetail'
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
 *     description: |
 *       Fetches the structured multi-step form questions for a LinkedIn Easy Apply job posting.
 *
 *       ### Path Parameters
 *       - `id` (string, required): The unique LinkedIn job posting ID.
 *
 *       > [!IMPORTANT]
 *       > This endpoint parses the raw form fields (text boxes, dropdowns, radio buttons) and outputs their URN identifiers. These URNs are required when submitting answers via the **Submit application form** endpoint.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplyForm'
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
 *     description: |
 *       Submits Easy Apply form answers and file uploads for a job posting.
 *
 *       ### Request Body Properties
 *       - `formValues` (object, required): A flat map of URN string identifiers to answer values (e.g., `{"urn:li:fs_easyApplyFormElement:123456": "Yes"}`).
 *       - `referenceId` (string, optional): The form reference ID returned by the application form retrieval endpoint.
 *       - `resumeUrn` (string, optional): The LinkedIn URN of the uploaded resume document to attach to this application.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplySubmissionResult'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
jobsRouter.post('/:id/apply', jobsController.submitApplication);
