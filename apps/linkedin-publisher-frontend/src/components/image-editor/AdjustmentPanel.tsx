import type { Adjustments } from '../../types/imageEditor';

interface Props {
  adjustments: Adjustments;
  onChange: (adj: Adjustments) => void;
}

export function AdjustmentPanel({ adjustments, onChange }: Props) {
  const handleChange = (key: keyof Adjustments, value: number) => {
    onChange({ ...adjustments, [key]: value });
  };

  const formatValue = (v: number) => v === 0 ? '0' : v > 0 ? `+${v}` : `${v}`;

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-primary mb-3">Ajustes</h3>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="brightness" className="text-sm text-secondary">Brilho</label>
          <span className="text-sm font-medium text-primary">{formatValue(adjustments.brightness)}</span>
        </div>
        <input id="brightness" type="range" min="-100" max="100" value={adjustments.brightness}
          onChange={(e) => handleChange('brightness', Number(e.target.value))} aria-label="Brilho"
          className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-brand-blue" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="contrast" className="text-sm text-secondary">Contraste</label>
          <span className="text-sm font-medium text-primary">{formatValue(adjustments.contrast)}</span>
        </div>
        <input id="contrast" type="range" min="-100" max="100" value={adjustments.contrast}
          onChange={(e) => handleChange('contrast', Number(e.target.value))} aria-label="Contraste"
          className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-brand-blue" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="saturation" className="text-sm text-secondary">Saturação</label>
          <span className="text-sm font-medium text-primary">{formatValue(adjustments.saturation)}</span>
        </div>
        <input id="saturation" type="range" min="-100" max="100" value={adjustments.saturation}
          onChange={(e) => handleChange('saturation', Number(e.target.value))} aria-label="Saturação"
          className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-brand-blue" />
      </div>
    </div>
  );
}
