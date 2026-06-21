import { Router } from 'express';
import { carouselService } from '../services/carouselService';

const router = Router();

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
