"use client";

import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { registerDefault } from 'fumadocs-openapi/requests/generators/all';

const codeUsages = createCodeUsageGeneratorRegistry();

// Include default code generators (curl, js, python, go, etc.)
registerDefault(codeUsages);

export const APIPage = createOpenAPIPage({
  codeUsages,
});

