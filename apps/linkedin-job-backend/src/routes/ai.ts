import { Router } from 'express';
import { AIService } from '../services/aiService';
import { validateQuestions, validateResume } from '../middleware/validator';

const router = Router();

// Generate Answers using 9Router
/**
 * @openapi
 * /api/generate-answers:
 *   post:
 *     tags:
 *       - AI
 *     operationId: generateQuestionnaireAnswers
 *     summary: Generate questionnaire answers
 *     description: Invokes LLM integration (Gemini/Claude) via 9Router to programmatically formulate answers to easy-apply questions, based on the candidate's parsed resume and the job posting's context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *               - resume
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FormQuestion'
 *                 description: List of Easy-Apply questions extracted from the job posting.
 *               resume:
 *                 type: string
 *                 description: Raw resume text of the candidate.
 *                 example: "John Doe - Software Engineer..."
 *               jobContext:
 *                 type: string
 *                 description: Brief context about the job (e.g. title, company, requirements).
 *                 example: "React Developer at Google"
 *     responses:
 *       200:
 *         description: Answers generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       urn:
 *                         type: string
 *                         example: "urn:li:fs_easyApplyFormElement:123"
 *                       answer:
 *                         type: string
 *                         example: "Yes"
 */
router.post('/generate-answers', async (req, res, next) => {
  try {
    const { questions, resume, jobContext } = req.body;

    validateQuestions(questions);
    validateResume(resume);

    const aiService = new AIService();
    const result = await aiService.generateAnswers(questions, resume, jobContext);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
