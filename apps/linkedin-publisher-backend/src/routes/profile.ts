import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const profile = await prisma.resume.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!profile) {
      res.status(404).json({ error: 'Nenhum perfil sincronizado encontrado.' });
      return;
    }

    res.json({
      profileId: profile.profileId,
      name: profile.name,
      headline: profile.headline,
      photoUrl: profile.photoUrl,
      about: profile.about,
      experiences: profile.experienceJson ? JSON.parse(profile.experienceJson) : [],
      education: profile.educationJson ? JSON.parse(profile.educationJson) : [],
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do perfil' });
  }
});

export default router;
