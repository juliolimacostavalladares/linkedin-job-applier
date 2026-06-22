import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { gitConfig } from '@/lib/shared';
import { openapi } from '@/lib/openapi';
import { APIPage } from '@/components/api-page-client';

export default async function Page(props: PageProps<'/docs/[lang]/[[...slug]]'>) {
  const params = await props.params;
  const normalizedSlug = params.slug ?? [];
  console.log('[DEBUG] Route params:', { slug: params.slug, normalized: normalizedSlug, lang: params.lang });

  // Debug: Check what pages exist for this language
  const allPages = source.getPages(params.lang);
  console.log('[DEBUG] Total pages for', params.lang, ':', allPages.length);
  const allPagesNoLang = source.getPages();
  console.log('[DEBUG] Total pages WITHOUT lang param:', allPagesNoLang.length);
  if (allPages.length > 0) {
    console.log('[DEBUG] Sample pages:', allPages.slice(0, 3).map(p => ({ url: p.url, slugs: p.slugs })));
  }

  const page = source.getPage(normalizedSlug, params.lang);
  console.log('[DEBUG] Page found:', !!page, page ? page.url : 'null');
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const openapiProps = await openapi.preloadOpenAPIPage(page);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${params.lang}/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
            OpenAPIPage: (props) => <APIPage {...openapiProps} {...props} />,
            APIPage: (props) => <APIPage {...openapiProps} {...props} />,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams().map((params) => {
    const slug = params.slug && params.slug[0] === params.lang ? params.slug.slice(1) : params.slug;
    return {
      lang: params.lang ?? 'pt-BR',
      slug,
    };
  });
}

export async function generateMetadata(props: PageProps<'/docs/[lang]/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug ?? [], params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
