/**
 * Ícone de fonte reutilizável para indicar canal de candidatura.
 * - SystemIcon: ícone colorido "A" (Antigravity/automático) com gradiente
 * - LinkedInIcon: ícone "in" estilo LinkedIn azul
 */

interface IconProps {
  size?: 'sm' | 'md';
}

/** Ícone do nosso sistema — "A" com gradiente roxo/azul vibrante */
export function SystemIcon({ size = 'sm' }: IconProps) {
  const dim = size === 'sm' ? 'w-[14px] h-[14px] text-[8px]' : 'w-[18px] h-[18px] text-[10px]';
  return (
    <span
      className={`inline-flex items-center justify-center ${dim} font-black text-white rounded-[3px] shrink-0`}
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}
      title="Candidatado pelo Sistema"
    >
      A
    </span>
  );
}

/** Ícone do LinkedIn — "in" azul oficial */
export function LinkedInIcon({ size = 'sm' }: IconProps) {
  const dim = size === 'sm' ? 'w-[14px] h-[14px] text-[8px]' : 'w-[18px] h-[18px] text-[10px]';
  return (
    <span
      className={`inline-flex items-center justify-center ${dim} font-black text-white rounded-[3px] shrink-0`}
      style={{ background: '#0A66C2' }}
      title="Candidatado no LinkedIn"
    >
      in
    </span>
  );
}
