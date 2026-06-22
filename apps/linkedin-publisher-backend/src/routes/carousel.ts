import { Router } from 'express';
import { carouselService } from '../services/carouselService';

const router = Router();

/**
 * @openapi
 * /api/carousel/generate-pdf:
 *   post:
 *     tags:
 *       - Carousel
 *     operationId: generateCarouselPdf
 *     summary: Generate carousel PDF
 *     description: Generates a LinkedIn-optimized carousel PDF (1080x1350px) from a slide configuration. Uses Puppeteer to render HTML slides with syntax highlighting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slides
 *             properties:
 *               title:
 *                 type: string
 *                 description: Carousel title
 *                 example: "TypeScript Tips"
 *               authorName:
 *                 type: string
 *                 description: Author name displayed on slides
 *                 example: "John Doe"
 *               theme:
 *                 type: string
 *                 enum: [dark-premium, gradient-purple, startup-clean, bold-yellow, warm-creative]
 *                 description: "Visual theme, default is dark-premium"
 *               slides:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - content
 *                   properties:
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     code:
 *                       type: string
 *                 description: Array of slide objects
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Slides are required
 */
router.post('/generate-pdf', async (req, res) => {
  const { theme, title, authorName, slides } = req.body;

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    res.status(400).json({ error: 'Os slides são obrigatórios para a geração do PDF' });
    return;
  }

  try {
    const config = {
      theme: theme || 'dark-premium',
      title: title || 'LinkedIn Carousel',
      authorName: authorName || 'Julio Lima',
      slides,
    };

    const pdfBuffer = await carouselService.generatePdfBuffer(config);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="carousel-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar o arquivo PDF' });
  }
});

export default router;
