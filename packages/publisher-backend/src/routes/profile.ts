import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * @openapi
 * /api/profile:
 *   get:
 *     tags:
 *       - Profile
 *     operationId: getPublisherProfile
 *     summary: Get profile data
 *     description: Returns the latest synchronized profile from the database including identity, experiences, and education.
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileId:
 *                   type: string
 *                   example: "ACoAAB..."
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 headline:
 *                   type: string
 *                   example: "Senior Software Engineer"
 *                 photoUrl:
 *                   type: string
 *                 about:
 *                   type: string
 *                 experiences:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       company:
 *                         type: string
 *                       role:
 *                         type: string
 *                       duration:
 *                         type: string
 *                       description:
 *                         type: string
 *                 education:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       institution:
 *                         type: string
 *                       degree:
 *                         type: string
 *                       duration:
 *                         type: string
 *       404:
 *         description: No profile synced
 */
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
