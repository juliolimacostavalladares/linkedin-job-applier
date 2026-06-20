interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AltTextEditor({ value, onChange }: Props) {
  const maxLength = 1000;

  return (
    <div className="p-4 border-t border-border-color">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="altText" className="text-sm font-semibold text-primary">
          Texto alternativo
        </label>
        <span className="text-xs text-secondary">{value.length} / {maxLength}</span>
      </div>
      <textarea
        id="altText"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={3}
        placeholder="Como você descreveria esta imagem para alguém que não pode vê-la?"
        className="w-full px-3 py-2 bg-bg-input border border-border-color rounded-lg text-sm text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
      />
      <p className="mt-1 text-xs text-secondary">
        O texto alternativo ajuda pessoas que usam leitores de tela
      </p>
    </div>
  );
}
