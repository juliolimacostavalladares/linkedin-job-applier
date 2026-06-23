'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let cancelled = false;

    import('mermaid').then((mermaid) => {
      if (cancelled) return;

      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
      });

      mermaid.default.render(`mermaid-${Math.random().toString(36).slice(2, 8)}`, chart).then(({ svg }) => {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border bg-fd-card p-4"
    />
  );
}
