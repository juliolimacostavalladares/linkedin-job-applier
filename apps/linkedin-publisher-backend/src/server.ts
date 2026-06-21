import express from 'express';
import cors from 'cors';
import { config } from './config';
import postsRouter from './routes/posts';
import aiRouter from './routes/ai';
import credentialsRouter from './routes/credentials';
import profileRouter from './routes/profile';
import { prisma } from './lib/prisma';

const app = express();

app.use(cors({
  origin: config.cors.allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/posts', postsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/credentials', credentialsRouter);
app.use('/api/profile', profileRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'linkedin-publisher-backend' });
});

// Simple scheduling worker ticking every 30 seconds
setInterval(async () => {
  try {
    const now = new Date();
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (scheduledPosts.length > 0) {
      console.log(`[Scheduler] Encontrados ${scheduledPosts.length} posts agendados para publicar.`);
      
      for (const post of scheduledPosts) {
        try {
          const creds = await prisma.credentials.findFirst({
            orderBy: { updatedAt: 'desc' },
          });

          if (!creds) {
            console.error(`[Scheduler Error] Sem credenciais salvas do LinkedIn para publicar o post #${post.id}`);
            continue;
          }

          const query = `
            mutation CreatePost($cookie: String!, $csrf: String!, $headersJson: String, $text: String!, $mediaUrn: String) {
              createPost(cookie: $cookie, csrf: $csrf, headersJson: $headersJson, text: $text, mediaUrn: $mediaUrn) {
                success
                postId
                error
              }
            }
          `;

          const response = await fetch(config.services.linkedinGraphQLUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              variables: {
                cookie: creds.cookie,
                csrf: creds.csrf,
                headersJson: creds.headersJson,
                text: post.text,
                mediaUrn: post.mediaUrn || null,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`GraphQL Service HTTP Error: ${response.statusText}`);
          }

          const result = (await response.json()) as {
            data?: { createPost: { success: boolean; postId?: string; error?: string } };
          };

          if (result.data?.createPost.success) {
            await prisma.post.update({
              where: { id: post.id },
              data: {
                status: 'published',
                publishedAt: now,
                scheduledAt: null,
                linkedinId: result.data.createPost.postId || null,
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
              },
            });
            console.log(`[Scheduler] Post #${post.id} publicado com sucesso no LinkedIn.`);
          } else {
            console.error(
              `[Scheduler Error] Falha ao publicar post #${post.id} no LinkedIn:`,
              result.data?.createPost.error
            );
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error(`[Scheduler Error] Falha ao executar publicação do post #${post.id}:`, errMsg);
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler Error]:', error);
  }
}, 30000); // 30 seconds

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 LinkedIn Publisher Backend rodando na porta ${config.port} em modo ${config.nodeEnv}`);
});
