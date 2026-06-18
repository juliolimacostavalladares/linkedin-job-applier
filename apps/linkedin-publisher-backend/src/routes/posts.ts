import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Helper to generate mock metrics for published posts
function generateMockMetrics() {
  return {
    views: Math.floor(Math.random() * 800) + 150,
    likes: Math.floor(Math.random() * 80) + 12,
    comments: Math.floor(Math.random() * 15) + 2,
    shares: Math.floor(Math.random() * 6) + 1,
  };
}

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar publicações' });
  }
});

// GET single post
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    if (!post) {
      res.status(404).json({ error: 'Publicação não encontrada' });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar publicação' });
  }
});

// POST create post
router.post('/', async (req, res) => {
  const { text, type, mediaUrl, mediaName, status, scheduledAt } = req.body;

  if (!text) {
    res.status(400).json({ error: 'Texto é obrigatório' });
    return;
  }

  try {
    const isPublished = status === 'published';
    const metrics = isPublished ? generateMockMetrics() : null;

    const post = await prisma.post.create({
      data: {
        text,
        type: type || 'text',
        mediaUrl: mediaUrl || null,
        mediaName: mediaName || null,
        status: status || 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: isPublished ? new Date() : null,
        views: metrics?.views || 0,
        likes: metrics?.likes || 0,
        comments: metrics?.comments || 0,
        shares: metrics?.shares || 0,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar publicação' });
  }
});

// PUT update post
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text, type, mediaUrl, mediaName, status, scheduledAt } = req.body;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Publicação não encontrada' });
      return;
    }

    const wasPublished = existing.status === 'published';
    const isPublishing = status === 'published';

    // Se está publicando agora pela primeira vez, gera métricas fictícias
    let metricsUpdate = {};
    if (isPublishing && !wasPublished) {
      const metrics = generateMockMetrics();
      metricsUpdate = {
        publishedAt: new Date(),
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
      };
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        text: text !== undefined ? text : existing.text,
        type: type !== undefined ? type : existing.type,
        mediaUrl: mediaUrl !== undefined ? mediaUrl : existing.mediaUrl,
        mediaName: mediaName !== undefined ? mediaName : existing.mediaName,
        status: status !== undefined ? status : existing.status,
        scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : existing.scheduledAt,
        ...metricsUpdate,
      },
    });

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar publicação' });
  }
});

// DELETE post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.post.delete({
      where: { id },
    });
    res.json({ message: 'Publicação excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir publicação' });
  }
});

// POST publish post now
router.post('/:id/publish', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Publicação não encontrada' });
      return;
    }

    const metrics = generateMockMetrics();
    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        scheduledAt: null,
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
      },
    });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao publicar imediatamente' });
  }
});

export default router;
