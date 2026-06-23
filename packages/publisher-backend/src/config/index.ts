import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  nineRouter: {
    apiKey: process.env.NINE_ROUTER_API_KEY || '',
    baseUrl: process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1',
    model: process.env.NINE_ROUTER_MODEL || 'ag/gemini-3.5-flash-low',
  },

  ai: {
    provider: process.env.AI_PROVIDER || '9router',
    nineRouter: {
      apiKey: process.env.NINE_ROUTER_API_KEY || '',
      baseUrl: process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1',
      model: process.env.NINE_ROUTER_MODEL || 'ag/gemini-3.5-flash-low',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b',
    },
  },

  cors: {
    allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5175'],
  },

  services: {
    linkedinGraphQLUrl: process.env.LINKEDIN_SERVICE_URL || 'http://localhost:4000/graphql',
  },
};
