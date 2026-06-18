/**
 * Ícones reutilizáveis de fonte de candidatura.
 * - SystemIcon: "A" com gradiente roxo/azul vibrante (nosso sistema)
 * - LinkedInIcon: "in" azul oficial (#0A66C2)
 */

interface IconProps {
  /** sm = 14×14px (inline em textos/badges), md = 18×18px (destaque no Canal) */
  size?: 'sm' | 'md';
}

/** Ícone do nosso sistema — "A" com gradiente roxo→azul vibrante */
export function SystemIcon({ size = 'sm' }: IconProps) {
  const cls =
    size === 'sm'
      ? 'w-[14px] h-[14px] text-[8px] rounded-[3px]'
      : 'w-[20px] h-[20px] text-[11px] rounded-[4px]';
  return (
    <span
      className={`inline-flex items-center justify-center font-black text-white shrink-0 ${cls}`}
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}
      title="Candidatado pelo Sistema"
    >
      A
    </span>
  );
}

/** Ícone do LinkedIn — "in" azul oficial */
export function LinkedInIcon({ size = 'sm' }: IconProps) {
  const cls =
    size === 'sm'
      ? 'w-[14px] h-[14px] text-[8px] rounded-[3px]'
      : 'w-[20px] h-[20px] text-[11px] rounded-[4px]';
  return (
    <span
      className={`inline-flex items-center justify-center font-black text-white shrink-0 normal-case ${cls}`}
      style={{ background: '#0A66C2' }}
      title="Candidatado no LinkedIn"
    >
      in
    </span>
  );
}
