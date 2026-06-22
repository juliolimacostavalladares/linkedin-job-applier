import { Router } from 'express';
import { AIService } from '../services/aiService';

const router = Router();

/**
 * @openapi
 * /api/ai/generate-post:
 *   post:
 *     tags:
 *       - AI
 *     operationId: generatePost
 *     summary: Generate LinkedIn post content
 *     description: Uses Gemini to generate LinkedIn post content based on a prompt and tone.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Topic or idea for the post
 *                 example: "React Server Components best practices"
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, technical, inspirational]
 *                 description: "Content tone, default is professional"
 *     responses:
 *       200:
 *         description: Post content generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: Generated post text
 *       400:
 *         description: Prompt is required
 */
router.post('/generate-post', async (req, res) => {
  const { prompt, tone } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt é obrigatório' });
    return;
  }

  try {
    const text = await AIService.generatePost(prompt, tone || 'professional');
    res.json({ text });
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Falha ao gerar post' });
  }
});

/**
 * @openapi
 * /api/ai/generate-carousel:
 *   post:
 *     tags:
 *       - AI
 *     operationId: generateCarousel
 *     summary: Generate carousel slide structure
 *     description: Uses Gemini to generate a carousel JSON structure from a prompt. The output can be passed to the Generate PDF endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Topic for the carousel
 *                 example: "10 TypeScript tips every developer should know"
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, technical, inspirational]
 *     responses:
 *       200:
 *         description: Carousel structure generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 authorName:
 *                   type: string
 *                 slides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       code:
 *                         type: string
 *       400:
 *         description: Prompt is required
 */
router.post('/generate-carousel', async (req, res) => {
  const { prompt, tone } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt é obrigatório' });
    return;
  }

  try {
    const jsonText = await AIService.generateCarousel(prompt, tone || 'professional');
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error) {
    console.error('Error generating carousel:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Falha ao gerar carrossel',
      rawText: error instanceof SyntaxError ? 'Retorno inválido do modelo' : undefined
    });
  }
});

export default router;
