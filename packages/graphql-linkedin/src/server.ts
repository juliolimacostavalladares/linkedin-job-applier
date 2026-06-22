import dotenv from 'dotenv';
import { initializeApp } from './app';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = await initializeApp();

  app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info('LinkedIn Gateway Service started', {
      port: PORT,
      endpoint: `http://localhost:${PORT}/graphql`,
      healthCheck: `http://localhost:${PORT}/health`,
      swaggerDocs: `http://localhost:${PORT}/api-docs`,
    });
    console.log(`LinkedIn Gateway Service running on http://localhost:${PORT}/graphql`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

startServer().catch((err: unknown) => {
  const errMsg = err instanceof Error ? err.message : String(err);
  logger.error('Failed to start LinkedIn Gateway Service', { error: errMsg });
  process.exit(1);
});

