import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { apiRouter } from './routes/api';
import { logger } from './utils/logger';
import { redactSensitiveData } from './utils/security';
import { LinkedInRequest } from './types/express';

export const app = express();


const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    logger.error('GraphQL Error', {
      message: error.message,
      path: error.path,
    });
    return error;
  },
});

export async function initializeApp(): Promise<express.Application> {
  await apolloServer.start();

  app.use(cors());
  app.use(express.json());

  // Swagger/OpenAPI setup
  const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'LinkedIn Gateway Service API',
        version: '1.0.0',
        description: 'REST and GraphQL gateway service to interface with LinkedIn Voyager APIs securely.',
      },
      components: {
        securitySchemes: {
          LinkedInCookie: {
            type: 'apiKey',
            in: 'header',
            name: 'x-linkedin-cookie',
            description: 'LinkedIn session cookie (contains li_at, JSESSIONID, etc.)',
          },
          LinkedInCsrf: {
            type: 'apiKey',
            in: 'header',
            name: 'x-linkedin-csrf',
            description: 'LinkedIn CSRF token (must match JSESSIONID from cookie)',
          },
        },
      },
      security: [
        {
          LinkedInCookie: [],
          LinkedInCsrf: [],
        },
      ],
    },
    apis: [
      './src/routes/*.ts',
      './src/routes/*.js',
      './dist/routes/*.js',
    ],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
  // Expose Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Expose raw OpenAPI JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // REST API routes
  app.use('/api', apiRouter);

  // GraphQL Apollo Middleware
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const gqlReq = req as LinkedInRequest;
        const sanitizedVariables = redactSensitiveData(gqlReq.body?.variables);
        logger.info('GraphQL Request received', {
          query: gqlReq.body?.query?.trim().slice(0, 300),
          variables: sanitizedVariables,
        });
        return {};
      },
    })
  );

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'linkedin-graphql-service' });
  });

  // Global Error Handler (prevents stacktrace leakage)
  app.use((err: unknown, req: express.Request, res: Response, next: NextFunction) => {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Unhandled server error', { error: errorMsg });

    // Safely cast or structure error to avoid any
    const errObj = err as Record<string, unknown>;
    const status = typeof errObj?.statusCode === 'number' ? errObj.statusCode : 500;

    res.status(status).json({
      error: status === 401 ? 'Unauthorized' : 'Internal Server Error',
      message: status === 500 ? 'An unexpected error occurred' : errorMsg,
    });
  });

  return app;
}
