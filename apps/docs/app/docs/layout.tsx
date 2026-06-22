import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { Layers, Briefcase, Rocket, Wrench } from 'lucide-react';
import { ServiceThemeProvider } from '@/components/service-theme-provider';

const serviceTabs = [
  {
    title: 'All Services',
    description: 'Overview and getting started guides',
    url: '/docs',
    icon: <Layers className="size-4" />,
  },
  {
    title: 'LinkedIn Gateway',
    description: 'REST + GraphQL proxy to LinkedIn Voyager',
    url: '/docs/gateway/overview',
    icon: <Wrench className="size-4" />,
  },
  {
    title: 'Job Backend',
    description: 'AI-powered job application automation',
    url: '/docs/job-backend/overview',
    icon: <Briefcase className="size-4" />,
  },
  {
    title: 'Publisher Backend',
    description: 'Content creation and publishing platform',
    url: '/docs/publisher-backend/overview',
    icon: <Rocket className="size-4" />,
  },
];

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <ServiceThemeProvider>
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        tabs={serviceTabs}
        tabMode="auto"
      >
        {children}
      </DocsLayout>
    </ServiceThemeProvider>
  );
}
