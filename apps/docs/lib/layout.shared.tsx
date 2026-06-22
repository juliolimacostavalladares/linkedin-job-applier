import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { DynamicNavTitle } from '@/components/dynamic-nav-title';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: <DynamicNavTitle />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
