import { Router } from 'express';
import * as profileController from '../controllers/profileController';

export const profileRouter = Router();

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
profileRouter.get('/info', profileController.getProfileInfo);

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
profileRouter.get('/resume-pdf', profileController.getResumePdf);
