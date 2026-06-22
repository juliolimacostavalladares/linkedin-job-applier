'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

const serviceThemes: Record<string, string> = {
  '/docs/gateway': 'service-gateway',
  '/docs/job-backend': 'service-job',
  '/docs/publisher-backend': 'service-publisher',
};

function getServiceTheme(pathname: string): string {
  for (const [prefix, className] of Object.entries(serviceThemes)) {
    if (pathname.startsWith(prefix)) return className;
  }
  return '';
}

export function ServiceThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = getServiceTheme(pathname);

  return (
    <div data-service={theme || undefined} className={theme}>
      {children}
    </div>
  );
}
