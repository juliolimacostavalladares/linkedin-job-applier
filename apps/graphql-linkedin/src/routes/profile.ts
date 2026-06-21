import { Router } from 'express';
import * as profileController from '../controllers/profileController';

export const profileRouter = Router();

/**
 * @openapi
 * /api/profile/info:
 *   get:
 *     tags:
 *       - Profile
 *     operationId: getProfileInfo
 *     summary: Retrieve profile info
 *     description: |
 *       Downloads the member's profile summary in PDF format directly from LinkedIn, parses the text stream, and extracts structured info including work experiences, bio descriptions, and education details in a clean JSON hierarchy.
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
 *     tags:
 *       - Profile
 *     operationId: getResumePdf
 *     summary: Retrieve resume PDF
 *     description: |
 *       Generates and downloads the user's resume PDF from LinkedIn. Returns the raw text payload along with a base64-encoded representation of the PDF file.
 *
 *       ### Query Parameters
 *       - `profileId` (string, required): The target member URN ID on LinkedIn (e.g. `ACoAAB...`).
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
