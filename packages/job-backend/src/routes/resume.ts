import { Router } from 'express';
import { resumeService } from '../services/resumeService';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { validateProfileId } from '../middleware/validator';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/resume/from-linkedin
/**
 * @openapi
 * /api/resume/from-linkedin:
 *   post:
 *     tags:
 *       - Resume
 *     operationId: importProfilePdfFromLinkedin
 *     summary: Import profile PDF from LinkedIn
 *     description: Downloads the member's profile summary in PDF format, parses the text stream, and caches the resume in the SQLite database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileId
 *             properties:
 *               profileId:
 *                 type: string
 *                 description: The unique member identifier on LinkedIn.
 *                 example: "ACoAAB..."
 *     responses:
 *       200:
 *         description: LinkedIn profile imported and parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumePdfResult'
 *       401:
 *         description: LinkedIn session credentials missing
 */
router.post('/from-linkedin', async (req, res, next) => {
  try {
    const { profileId } = req.body;
    validateProfileId(profileId);

    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      return res.status(401).json({ error: 'Credenciais do LinkedIn ausentes no servidor.' });
    }

    const query = `
      query GetResumePdf($profileId: String!, $cookie: String!, $csrf: String!, $headersJson: String) {
        resumePdf(profileId: $profileId, cookie: $cookie, csrf: $csrf, headersJson: $headersJson) {
          success
          text
          pdfBase64
        }
      }
    `;

    interface ResumePdfResponse {
      resumePdf: {
        success: boolean;
        text: string;
        pdfBase64: string;
      };
    }

    const data = await queryGraphQL<ResumePdfResponse>(query, {
      profileId,
      cookie: creds.cookie,
      csrf: creds.csrf,
      headersJson: creds.headersJson,
    });

    const result = data.resumePdf;

    await resumeService.upsert(profileId, result.text, 'Curriculo_LinkedIn.pdf');

    res.json({ success: true, text: result.text, pdfBase64: result.pdfBase64 });
  } catch (error) {
    next(error);
  }
});

interface ExperienceInput {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

interface EducationInput {
  institution: string;
  degree: string;
  duration: string;
}

// POST /api/resume/sync-profile-data - Save synced profile data directly from Extension
/**
 * @openapi
 * /api/resume/sync-profile-data:
 *   post:
 *     tags:
 *       - Resume
 *     operationId: syncProfileDataFromChromeExtension
 *     summary: Sync profile data from Chrome extension
 *     description: Directly receives and persists structured user identity, experiences, and education sync'd by the Chrome extension.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profileId
 *               - name
 *             properties:
 *               profileId:
 *                 type: string
 *                 example: "ACoAAB..."
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               headline:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               photoUrl:
 *                 type: string
 *                 example: "https://media.licdn.com/..."
 *               about:
 *                 type: string
 *                 example: "Passionate developer..."
 *               experiences:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WorkExperience'
 *               education:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Education'
 *     responses:
 *       200:
 *         description: Profile data saved and structured successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileInfo'
 */
router.post('/sync-profile-data', async (req, res, next) => {
  try {
    const { profileId, name, headline, photoUrl, about, experiences, education } = req.body;
    validateProfileId(profileId);

    // Reconstruct the text resume
    let reconstructedText = `${name}\n${headline}\n\n`;
    if (about) {
      reconstructedText += `SOBRE\n${about}\n\n`;
    }
    if (experiences && Array.isArray(experiences)) {
      reconstructedText += `EXPERIÊNCIA\n`;
      (experiences as ExperienceInput[]).forEach((exp) => {
        reconstructedText += `- ${exp.role} em ${exp.company} (${exp.duration})\n`;
        if (exp.description) {
          reconstructedText += `  ${exp.description}\n`;
        }
      });
      reconstructedText += `\n`;
    }
    if (education && Array.isArray(education)) {
      reconstructedText += `EDUCAÇÃO\n`;
      (education as EducationInput[]).forEach((edu) => {
        reconstructedText += `- ${edu.institution}: ${edu.degree} (${edu.duration})\n`;
      });
      reconstructedText += `\n`;
    }
    const pdfText = reconstructedText.trim();

    // Save/upsert to DB using resumeService
    const result = await resumeService.upsert(profileId, pdfText, 'Curriculo_LinkedIn.pdf', {
      name,
      headline,
      photoUrl,
      about,
      experienceJson: JSON.stringify(experiences),
      educationJson: JSON.stringify(education),
    });

    res.json({
      success: true,
      profileId,
      name,
      headline,
      photoUrl,
      about,
      experiences,
      education,
      text: pdfText,
      filename: 'Curriculo_LinkedIn.pdf'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/resume - Save resume text directly
/**
 * @openapi
 * /api/resume:
 *   post:
 *     tags:
 *       - Resume
 *     operationId: saveRawResumeText
 *     summary: Save raw resume text
 *     description: Directly upserts raw resume text details.
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
 *                 description: Plain text content of the resume.
 *                 example: "John Doe Resume content..."
 *               filename:
 *                 type: string
 *                 example: "Curriculo_LinkedIn.pdf"
 *               profileId:
 *                 type: string
 *                 example: "ACoAAB..."
 *     responses:
 *       200:
 *         description: Resume text saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing resume text
 */
router.post('/', async (req, res, next) => {
  try {
    const { text, filename, profileId } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto do currículo é obrigatório' });
    }
    const resume = await resumeService.upsert(profileId || null, text, filename || null);
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
});

// GET /api/resume/latest - Get latest resume
/**
 * @openapi
 * /api/resume/latest:
 *   get:
 *     tags:
 *       - Resume
 *     operationId: retrieveLatestResume
 *     summary: Retrieve latest resume
 *     description: Returns the latest cached resume model from the SQLite database.
 *     responses:
 *       200:
 *         description: Latest resume retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resume:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     text:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/latest', async (req, res, next) => {
  try {
    const resume = await resumeService.getLatest();
    res.json({ resume });
  } catch (error) {
    next(error);
  }
});

// GET /api/resume/profile - Get structured user profile and experiences
/**
 * @openapi
 * /api/resume/profile:
 *   get:
 *     tags:
 *       - Resume
 *     operationId: retrieveStructuredProfile
 *     summary: Retrieve structured profile
 *     description: Returns the candidates full identity, biography, experience log, and study log. Can optionally sync from LinkedIn in real-time.
 *     parameters:
 *       - in: query
 *         name: sync
 *         schema:
 *           type: boolean
 *         description: If true, triggers a fresh real-time sync with LinkedIn.
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileInfo'
 *       401:
 *         description: Credentials missing
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { sync } = req.query;

    // 1. Check if we already have it in the DB
    const latest = await resumeService.getLatest();

    if (latest && !sync) {
      let experiences = [];
      let education = [];
      try {
        if (latest.experienceJson) experiences = JSON.parse(latest.experienceJson);
        if (latest.educationJson) education = JSON.parse(latest.educationJson);
      } catch (err) {
        logger.error('Error parsing stored experience/education JSON:', err);
      }

      return res.json({
        profileId: latest.profileId,
        name: latest.name,
        headline: latest.headline,
        photoUrl: latest.photoUrl,
        about: latest.about,
        experiences,
        education,
        text: latest.text,
        filename: latest.filename,
      });
    }

    // 2. Otherwise, we need to sync from LinkedIn!
    const creds = await credentialsService.getCookieAndCsrf();
    if (!creds) {
      return res.status(401).json({ error: 'Credenciais do LinkedIn ausentes no servidor.' });
    }

    logger.info('Syncing profile from LinkedIn (on-demand/first-load)');
    const result = await resumeService.syncProfile(creds.cookie, creds.csrf, creds.headersJson);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
