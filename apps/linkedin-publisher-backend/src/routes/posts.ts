import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';

const router = Router();

interface CreatePostResponse {
  createPost: {
    success: boolean;
    postId?: string;
    error?: string;
  };
}

async function publishToLinkedIn(text: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  const creds = await credentialsService.getLatest();
  if (!creds) {
    return {
      success: false,
      error: 'LinkedIn não conectado. Por favor, utilize a extensão para sincronizar as credenciais.',
    };
  }

  const query = `
    mutation CreatePost($cookie: String!, $csrf: String!, $headersJson: String, $text: String!) {
      createPost(cookie: $cookie, csrf: $csrf, headersJson: $headersJson, text: $text) {
        success
        postId
        error
      }
    }
  `;

  try {
    const data = await queryGraphQL<CreatePostResponse>(query, {
      cookie: creds.cookie,
      csrf: creds.csrf,
      headersJson: creds.headersJson,
      text,
    });

    return data.createPost;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
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

    if (isPublished) {
      const result = await publishToLinkedIn(text);
      if (!result.success) {
        res.status(400).json({ error: result.error || 'Falha ao publicar no LinkedIn' });
        return;
      }
    }

    const post = await prisma.post.create({
      data: {
        text,
        type: type || 'text',
        mediaUrl: mediaUrl || null,
        mediaName: mediaName || null,
        status: status || 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: isPublished ? new Date() : null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
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

    if (isPublishing && !wasPublished) {
      const postText = text !== undefined ? text : existing.text;
      const result = await publishToLinkedIn(postText);
      if (!result.success) {
        res.status(400).json({ error: result.error || 'Falha ao publicar no LinkedIn' });
        return;
      }
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
        publishedAt: isPublishing && !wasPublished ? new Date() : existing.publishedAt,
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

    const result = await publishToLinkedIn(existing.text);
    if (!result.success) {
      res.status(400).json({ error: result.error || 'Falha ao publicar no LinkedIn' });
      return;
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        scheduledAt: null,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      },
    });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao publicar imediatamente' });
  }
});

export default router;
