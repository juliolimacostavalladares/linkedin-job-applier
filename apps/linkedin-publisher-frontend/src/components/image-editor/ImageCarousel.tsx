import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: File[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function ImageCarousel({ images, currentIndex, onNavigate }: ImageCarouselProps) {
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border-color">
      <button
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={!canGoPrevious}
        className="p-2 rounded-lg hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium text-secondary">
        {currentIndex + 1} de {images.length}
      </span>

      <button
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={!canGoNext}
        className="p-2 rounded-lg hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Próxima imagem"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
