import { Router } from 'express';
import { AIService } from '../services/aiService';
import { validateQuestions, validateResume } from '../middleware/validator';

const router = Router();

// Generate Answers using 9Router
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
