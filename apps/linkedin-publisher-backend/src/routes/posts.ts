import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { credentialsService } from '../services/credentialsService';
import { queryGraphQL } from '../utils/graphqlClient';
import { uploadImages, uploadDocument } from '../services/imageUploadService';
import multer from 'multer';

const router = Router();

// Configure multer for handling image uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 9, // LinkedIn supports up to 9 images per post
  },
  fileFilter: (_req, file, cb) => {
    // Accept image and PDF files
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

interface CreatePostResponse {
  createPost: {
    success: boolean;
    postId?: string;
    error?: string;
  };
}

async function publishToLinkedIn(
  text: string,
  mediaUrn?: string,
  mediaCategory?: string,
  documentSharingTitle?: string,
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const creds = await credentialsService.getLatest();
  if (!creds) {
    return {
      success: false,
      error: 'LinkedIn não conectado. Por favor, utilize a extensão para sincronizar as credenciais.',
    };
  }

  const query = `
    mutation CreatePost($cookie: String!, $csrf: String!, $headersJson: String, $text: String!, $mediaUrn: String, $mediaCategory: String, $documentSharingTitle: String) {
      createPost(cookie: $cookie, csrf: $csrf, headersJson: $headersJson, text: $text, mediaUrn: $mediaUrn, mediaCategory: $mediaCategory, documentSharingTitle: $documentSharingTitle) {
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
      mediaUrn: mediaUrn || null,
      mediaCategory: mediaCategory || null,
      documentSharingTitle: documentSharingTitle || null,
    });

    return data.createPost;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// POST upload images
router.post('/upload-images', upload.array('images', 9), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
      return;
    }

    // Get credentials
    const creds = await credentialsService.getLatest();
    if (!creds) {
      res.status(401).json({
        error: 'LinkedIn não conectado. Por favor, utilize a extensão para sincronizar as credenciais.',
      });
      return;
    }

    // Parse dynamic headers
    let dynamicHeaders: Record<string, string> = {};
    if (creds.headersJson) {
      try {
        dynamicHeaders = JSON.parse(creds.headersJson);
      } catch {
        dynamicHeaders = {};
      }
    }

    // Convert files to buffers
    const imageBuffers = files.map((file) => file.buffer);

    // Upload images to LinkedIn
    const uploadResult = await uploadImages(creds.cookie, creds.csrf, dynamicHeaders, imageBuffers);

    if (!uploadResult.success) {
      res.status(500).json({ error: uploadResult.error || 'Falha ao fazer upload das imagens' });
      return;
    }

    res.json({
      success: true,
      mediaUrn: uploadResult.mediaUrn,
      imageCount: files.length,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
  }
});

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

// POST create post (with automatic image upload orchestration)
router.post('/', upload.array('images', 9), async (req, res) => {
  const { text, type, mediaUrl, mediaName, mediaUrn: bodyMediaUrn, linkedinId: bodyLinkedinId, status, scheduledAt } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!text) {
    res.status(400).json({ error: 'Texto é obrigatório' });
    return;
  }

  try {
    const isPublished = status === 'published';
    let mediaUrn: string | undefined = bodyMediaUrn || undefined;
    let publishedPostId: string | undefined = undefined;

    // Se houver imagens ou PDF, fazer upload automaticamente
    if (files && files.length > 0) {
      const creds = await credentialsService.getLatest();
      if (!creds) {
        res.status(401).json({
          error: 'LinkedIn não conectado. Por favor, utilize a extensão para sincronizar as credenciais.',
        });
        return;
      }

      let dynamicHeaders: Record<string, string> = {};
      if (creds.headersJson) {
        try {
          dynamicHeaders = JSON.parse(creds.headersJson);
        } catch {
          dynamicHeaders = {};
        }
      }

      const isPdf = files[0].mimetype === 'application/pdf';
      let uploadResult;

      if (isPdf) {
        uploadResult = await uploadDocument(
          creds.cookie,
          creds.csrf,
          dynamicHeaders,
          files[0].buffer,
          files[0].originalname
        );
      } else {
        const imageBuffers = files.map((file) => file.buffer);
        uploadResult = await uploadImages(creds.cookie, creds.csrf, dynamicHeaders, imageBuffers);
      }

      if (!uploadResult.success) {
        res.status(500).json({ error: uploadResult.error || 'Falha ao fazer upload dos arquivos' });
        return;
      }

      mediaUrn = uploadResult.mediaUrn;
    }

    // Publicar no LinkedIn se status for 'published'
    if (isPublished) {
      const isPdf = files && files.length > 0 && files[0].mimetype === 'application/pdf';
      const result = await publishToLinkedIn(
        text,
        mediaUrn,
        isPdf || type === 'document' ? 'DOCUMENT' : undefined,
        isPdf ? files[0].originalname : mediaName
      );
      if (!result.success) {
        res.status(400).json({ error: result.error || 'Falha ao publicar no LinkedIn' });
        return;
      }
      publishedPostId = result.postId;
    }

    // Salvar no banco de dados
    const isPdf = files && files.length > 0 && files[0].mimetype === 'application/pdf';
    const post = await prisma.post.create({
      data: {
        text,
        type: type || (isPdf ? 'document' : mediaUrn ? 'image' : 'text'),
        mediaUrl: mediaUrl || null,
        mediaName: mediaName || (isPdf ? files[0].originalname : null),
        mediaUrn: mediaUrn || null,
        linkedinId: publishedPostId || bodyLinkedinId || null,
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
  const { text, type, mediaUrl, mediaName, mediaUrn, linkedinId, status, scheduledAt } = req.body;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Publicação não encontrada' });
      return;
    }

    const wasPublished = existing.status === 'published';
    const isPublishing = status === 'published';

    let publishedPostId = existing.linkedinId;

    if (isPublishing && !wasPublished) {
      const postText = text !== undefined ? text : existing.text;
      const finalMediaUrn = mediaUrn !== undefined ? mediaUrn : (existing.mediaUrn || undefined);
      const isDocument = type === 'document' || existing.type === 'document';
      const result = await publishToLinkedIn(
        postText,
        finalMediaUrn,
        isDocument ? 'DOCUMENT' : undefined,
        mediaName || existing.mediaName || undefined
      );
      if (!result.success) {
        res.status(400).json({ error: result.error || 'Falha ao publicar no LinkedIn' });
        return;
      }
      publishedPostId = result.postId || null;
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        text: text !== undefined ? text : existing.text,
        type: type !== undefined ? type : existing.type,
        mediaUrl: mediaUrl !== undefined ? mediaUrl : existing.mediaUrl,
        mediaName: mediaName !== undefined ? mediaName : existing.mediaName,
        mediaUrn: mediaUrn !== undefined ? mediaUrn : existing.mediaUrn,
        linkedinId: linkedinId !== undefined ? linkedinId : publishedPostId,
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
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Publicação não encontrada' });
      return;
    }

    // Se o post foi publicado e temos o linkedinId, tentar deletar do LinkedIn
    if (existing.status === 'published' && existing.linkedinId) {
      const creds = await credentialsService.getLatest();
      if (creds) {
        const query = `
          mutation DeletePost($cookie: String!, $csrf: String!, $headersJson: String, $linkedinId: String!) {
            deletePost(cookie: $cookie, csrf: $csrf, headersJson: $headersJson, linkedinId: $linkedinId) {
              success
              error
            }
          }
        `;

        try {
          const result = await queryGraphQL<{ deletePost: { success: boolean; error?: string } }>(query, {
            cookie: creds.cookie,
            csrf: creds.csrf,
            headersJson: creds.headersJson,
            linkedinId: existing.linkedinId,
          });

          if (!result.deletePost.success) {
            console.error(`[Delete Error] Falha ao deletar post do LinkedIn: ${result.deletePost.error}`);
          } else {
            console.log(`[Delete Success] Post #${existing.id} deletado do LinkedIn.`);
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(`[Delete Error] Erro ao deletar post do LinkedIn:`, errMsg);
        }
      }
    }

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
  const { mediaUrn } = req.body;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Publicação não encontrada' });
      return;
    }

    const finalMediaUrn = mediaUrn || existing.mediaUrn || undefined;
    const isDocument = existing.type === 'document';
    const result = await publishToLinkedIn(
      existing.text,
      finalMediaUrn,
      isDocument ? 'DOCUMENT' : undefined,
      existing.mediaName || undefined
    );
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
        linkedinId: result.postId || null,
        type: finalMediaUrn ? 'image' : existing.type,
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
