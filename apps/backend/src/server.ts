import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger, httpLogger } from './utils/logger';

const app = express();
const PORT = config.port;

// Logging
logger.info('Starting server', { port: PORT, env: config.nodeEnv });
app.use(httpLogger);

// Middleware
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info('Server started', {
    port: PORT,
    environment: config.nodeEnv,
    healthCheck: `http://localhost:${PORT}/health`,
  });
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
