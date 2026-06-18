import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function Card({ children, className = '', onClick, active = false }: CardProps) {
  const baseStyles = 'rounded-lg p-4 transition-all duration-150 border';
  const interactiveStyles = onClick ? 'cursor-pointer select-none' : '';
  const activeStyles = active
    ? 'bg-bg-active-card border-border-active-card shadow-sm'
    : 'bg-bg-card border-border-color hover:bg-bg-hover';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${activeStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
