import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  linkedin: {
    cookie: process.env.LINKEDIN_COOKIE || '',
    csrf: process.env.LINKEDIN_CSRF || '',
  },

  nineRouter: {
    apiKey: process.env.NINE_ROUTER_API_KEY || '',
    baseUrl: process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1',
    model: process.env.NINE_ROUTER_MODEL || 'kr/claude-sonnet-4.5',
  },

  cors: {
    allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  },

  services: {
    linkedinGraphQLUrl: process.env.LINKEDIN_SERVICE_URL || 'http://localhost:4000/graphql',
  },
};
