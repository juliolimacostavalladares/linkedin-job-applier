import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // i18n redirect logic - redirect /docs to /docs/pt-BR
  const locales = ['pt-BR', 'en'];
  const defaultLocale = 'pt-BR';

  if (pathname.startsWith('/docs')) {
    const pathnameIsMissingLocale = locales.every(
      (locale) => !pathname.startsWith(`/docs/${locale}/`) && pathname !== `/docs/${locale}`
    );

    if (pathnameIsMissingLocale) {
      // Handle exact /docs path
      if (pathname === '/docs') {
        return NextResponse.redirect(new URL(`/docs/${defaultLocale}`, request.url));
      }

      // Handle /docs/* paths - insert locale after /docs
      const pathAfterDocs = pathname.replace('/docs', '');
      return NextResponse.redirect(new URL(`/docs/${defaultLocale}${pathAfterDocs}`, request.url));
    }
  }


  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return NextResponse.next();
}
