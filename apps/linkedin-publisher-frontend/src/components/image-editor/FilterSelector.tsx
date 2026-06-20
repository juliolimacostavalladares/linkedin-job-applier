import type { FilterType } from '../../types/imageEditor';

interface FilterSelectorProps {
  selected: FilterType;
  onSelect: (filter: FilterType) => void;
}

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'studio', label: 'Studio' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'prime', label: 'Prime' },
  { id: 'classic', label: 'Classic' },
  { id: 'edge', label: 'Edge' },
  { id: 'luminate', label: 'Luminate' }
];

export function FilterSelector({ selected, onSelect }: FilterSelectorProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-primary mb-3">Filtros</h3>
      <div className="grid grid-cols-4 gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className={`
              p-3 rounded-lg border-2 transition-all
              hover:border-brand-blue
              ${
                selected === filter.id
                  ? 'border-brand-blue ring-2 ring-brand-blue ring-opacity-30 bg-bg-active-card'
                  : 'border-border-color bg-bg-card'
              }
            `}
          >
            <div className="aspect-square bg-bg-hover rounded mb-2" />
            <span className="text-xs font-medium text-primary">
              {filter.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
