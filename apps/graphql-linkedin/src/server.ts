import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    logger.error('GraphQL Error', {
      message: error.message,
      path: error.path,
      locations: error.locations,
    });
    return error;
  },
});

async function startServer() {
  await server.start();

  app.use(cors());
  app.use(express.json());

  // Apollo Server GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Log incoming queries
        logger.info('GraphQL Request received', {
          query: req.body?.query?.trim().slice(0, 300),
          variables: req.body?.variables,
        });
        return {};
      },
    })
  );

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'linkedin-graphql-service' });
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    logger.info('LinkedIn GraphQL Service started', {
      port: PORT,
      endpoint: `http://localhost:${PORT}/graphql`,
      healthCheck: `http://localhost:${PORT}/health`,
    });
    console.log(`LinkedIn GraphQL Service running on http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err: unknown) => {
  const errMsg = err instanceof Error ? err.message : String(err);
  logger.error('Failed to start LinkedIn GraphQL Service', { error: errMsg });
  process.exit(1);
});
