'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

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

  useEffect(() => {
    const classesToRemove = Object.values(serviceThemes);
    
    // Apply changes to both documentElement (html) and body for maximum compatibility
    document.documentElement.classList.remove(...classesToRemove);
    document.body.classList.remove(...classesToRemove);
    
    if (theme) {
      document.documentElement.classList.add(theme);
      document.body.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
