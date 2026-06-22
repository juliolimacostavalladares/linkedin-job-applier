'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Layers, Briefcase, Rocket, Wrench } from 'lucide-react';

const serviceData: Record<string, { title: string; icon: React.ReactNode }> = {
  '/docs/gateway': {
    title: 'LinkedIn Gateway',
    icon: <Wrench className="size-5 text-blue-500 dark:text-blue-400" />,
  },
  '/docs/job-backend': {
    title: 'Job Backend',
    icon: <Briefcase className="size-5 text-emerald-500 dark:text-emerald-400" />,
  },
  '/docs/publisher-backend': {
    title: 'Publisher Backend',
    icon: <Rocket className="size-5 text-violet-500 dark:text-violet-400" />,
  },
};

export function DynamicNavTitle() {
  const pathname = usePathname();
  
  let currentService: { title: string; icon: React.ReactNode } = {
    title: 'All Services',
    icon: <Layers className="size-5 text-zinc-500" />,
  };

  for (const [prefix, data] of Object.entries(serviceData)) {
    if (pathname.startsWith(prefix)) {
      currentService = data;
      break;
    }
  }

  return (
    <div className="flex items-center gap-2.5 font-semibold text-[15px] select-none">
      {currentService.icon}
      <span className="tracking-tight text-fd-foreground">{currentService.title}</span>
    </div>
  );
}
