import swaggerJSDoc from 'swagger-jsdoc';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const swaggerOptions = {
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
    path.join(projectRoot, '../graphql-linkedin/src/routes/*.ts'),
    path.join(projectRoot, '../graphql-linkedin/src/routes/*.js'),
  ],
};

// Ensure public directory exists
const publicDir = path.join(projectRoot, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

const spec = swaggerJSDoc(swaggerOptions);
const openapiPath = path.join(publicDir, 'openapi.json');
writeFileSync(openapiPath, JSON.stringify(spec, null, 2));
console.log('OpenAPI spec generated at', openapiPath);

async function main() {
  const outputDir = path.join(projectRoot, 'content/docs/api');
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Use path relative to projectRoot (docs app root)
  const relativeInputPath = 'public/openapi.json';

  const openapi = createOpenAPI({
    input: [relativeInputPath],
  });

  await generateFiles({
    input: openapi,
    output: outputDir,
  });

  console.log('Fumadocs API documentation files generated successfully!');
}

main().catch((err) => {
  console.error('Failed to generate Fumadocs API documentation:', err);
  process.exit(1);
});
