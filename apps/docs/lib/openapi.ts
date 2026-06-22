import { createOpenAPI } from 'fumadocs-openapi/server';
import path from 'path';

export const openapi = createOpenAPI({
  input: [
    path.resolve('./public/openapi.json'),
    path.resolve('./public/openapi-backend.json'),
    path.resolve('./public/openapi-publisher.json'),
    path.resolve('./public/openapi-pt-BR.json'),
    path.resolve('./public/openapi-backend-pt-BR.json'),
    path.resolve('./public/openapi-publisher-pt-BR.json'),
  ],
});
