import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';

import { defineI18n } from 'fumadocs-core/i18n';

const i18n = defineI18n({
  languages: ['pt-BR', 'en'],
  defaultLanguage: 'pt-BR',
  parser: 'dir',
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  i18n,
  url(slugs, locale) {
    if (locale) {
      return '/' + ['docs', locale, ...slugs].join('/');
    }
    return '/' + ['docs', ...slugs].join('/');
  },
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
