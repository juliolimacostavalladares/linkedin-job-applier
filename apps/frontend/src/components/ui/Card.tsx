import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function Card({ children, className = '', onClick, active = false }: CardProps) {
  const baseStyles = 'rounded-3xl p-5 transition-all';
  const interactiveStyles = onClick ? 'cursor-pointer' : '';
  const activeStyles = active
    ? 'bg-gradient-to-r from-blue-900/40 to-[#121620] shadow-[0_8px_30px_rgb(0,0,0,0.2)] scale-[1.02] border border-blue-500/30'
    : 'bg-[#1a1f2e]/50 hover:bg-[#1a1f2e] shadow-sm border border-transparent hover:border-white/10';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${activeStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
