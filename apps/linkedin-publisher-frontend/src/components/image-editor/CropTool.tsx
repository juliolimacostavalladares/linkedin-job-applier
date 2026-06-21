import type { AspectRatio, CropArea } from '../../types/imageEditor';

interface Props {
  cropArea: CropArea | null;
  onCropChange: (crop: CropArea | null) => void;
}

const RATIOS: { id: AspectRatio; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'square', label: 'Quadrado (1:1)' },
  { id: '4:1', label: 'Banner (4:1)' },
  { id: '3:4', label: 'Retrato (3:4)' },
  { id: '16:9', label: 'Paisagem (16:9)' }
];

export function CropTool({ cropArea, onCropChange }: Props) {
  const handleChange = (ratio: AspectRatio) => {
    if (ratio === 'original') {
      onCropChange(null);
    } else {
      onCropChange({ x: 0, y: 0, width: 100, height: 100, aspectRatio: ratio });
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-primary mb-3">Recortar</h3>
      <div className="space-y-2">
        {RATIOS.map((r) => (
          <button
            key={r.id}
            onClick={() => handleChange(r.id)}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
              (cropArea?.aspectRatio === r.id) || (!cropArea && r.id === 'original')
                ? 'bg-bg-active-card text-brand-blue border-2 border-brand-blue'
                : 'bg-bg-card text-primary border border-border-color hover:border-brand-blue'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-secondary">
        Selecione a proporção desejada para recortar a imagem
      </p>
    </div>
  );
}
