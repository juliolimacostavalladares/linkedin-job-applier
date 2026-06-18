import express from 'express';
import cors from 'cors';
import { config } from './config';
import postsRouter from './routes/posts';
import aiRouter from './routes/ai';
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
        // Gera métricas aleatórias iniciais
        const views = Math.floor(Math.random() * 80) + 10;
        const likes = Math.floor(Math.random() * 10) + 1;
        
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedAt: now,
            scheduledAt: null,
            views,
            likes,
            comments: 0,
            shares: 0,
          },
        });
        
        console.log(`[Scheduler] Post #${post.id} publicado com sucesso.`);
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
