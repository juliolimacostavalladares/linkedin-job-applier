'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

const serviceThemes: Record<string, string> = {
  gateway: 'service-gateway',
  'job-backend': 'service-job',
  'publisher-backend': 'service-publisher',
};

function getServiceTheme(pathname: string): string {
  for (const [segment, className] of Object.entries(serviceThemes)) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`))
      return className;
  }
  return '';
}

export function ServiceThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = getServiceTheme(pathname);

  useEffect(() => {
    const classesToRemove = Object.values(serviceThemes);

    document.documentElement.classList.remove(...classesToRemove);
    document.body.classList.remove(...classesToRemove);

    if (theme) {
      document.documentElement.classList.add(theme);
      document.body.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
