import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  linkedin: {
    cookie: process.env.LINKEDIN_COOKIE || '',
    csrf: process.env.LINKEDIN_CSRF || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  cors: {
    allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  },

  services: {
    linkedinGraphQLUrl: process.env.LINKEDIN_SERVICE_URL || 'http://localhost:4000/graphql',
  },
};
