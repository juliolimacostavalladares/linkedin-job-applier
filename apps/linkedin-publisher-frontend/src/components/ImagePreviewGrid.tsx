import { X } from 'lucide-react';
import type { EditedImage } from '../types/imageEditor';

interface ImagePreviewGridProps {
  images: EditedImage[];
  onRemove: (index: number) => void;
}

export function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-text-secondary">
        {images.length} {images.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
      </p>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden bg-bg-hover group border border-border-color shadow-sm"
          >
            <img
              src={image.thumbnail}
              alt={image.altText || image.originalName}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remover imagem ${index + 1}`}
              className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-opacity duration-150 shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
