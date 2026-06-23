import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { Briefcase, Layers, Rocket, Wrench } from 'lucide-react';
import { ServiceThemeProvider } from '@/components/service-theme-provider';

const serviceTabs = [
  {
    title: 'All Services',
    description: 'Overview and quick start',
    url: '/docs',
    icon: <Layers className="size-4 icon-tab icon-tab-all" />,
  },
  {
    title: 'LinkedIn Gateway',
    description: 'REST + GraphQL proxy',
    url: '/docs/gateway/overview',
    icon: <Wrench className="size-4 icon-tab icon-tab-gateway" />,
  },
  {
    title: 'Job Backend',
    description: 'AI job automation',
    url: '/docs/job-backend/overview',
    icon: <Briefcase className="size-4 icon-tab icon-tab-job" />,
  },
  {
    title: 'Publisher Backend',
    description: 'Content publishing',
    url: '/docs/publisher-backend/overview',
    icon: <Rocket className="size-4 icon-tab icon-tab-publisher" />,
  },
];

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const tree = source.getPageTree(lang);

  const tabs = serviceTabs.map((tab) => ({
    ...tab,
    url: `/docs/${lang}${tab.url.replace('/docs', '')}`,
  }));

  return (
    <ServiceThemeProvider>
      <DocsLayout
        tree={tree}
        {...baseOptions()}
        tabs={tabs}
        tabMode="auto"
      >
        {children}
      </DocsLayout>
    </ServiceThemeProvider>
  );
}
