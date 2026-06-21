import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { APIPage } from './api-page-client';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    APIPage: APIPage,
    OpenAPIPage: APIPage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
