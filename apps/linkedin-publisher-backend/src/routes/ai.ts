import { Router } from 'express';
import { AIService } from '../services/aiService';

const router = Router();

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

export default router;
