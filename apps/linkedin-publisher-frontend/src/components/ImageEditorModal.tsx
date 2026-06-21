import { useState, useRef, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ImageCarousel } from './image-editor/ImageCarousel';
import { FilterSelector } from './image-editor/FilterSelector';
import { CropTool } from './image-editor/CropTool';
import { AdjustmentPanel } from './image-editor/AdjustmentPanel';
import { AltTextEditor } from './image-editor/AltTextEditor';
import { useCanvasEditor } from '../hooks/useCanvasEditor';
import { validateImageFiles } from '../utils/imageValidation';
import { type ImageEdits, type EditedImage, type FilterType, type CropArea, ASPECT_RATIO_VALUES, FILTER_PRESETS } from '../types/imageEditor';
import { useToast } from './ui/Toast';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (images: EditedImage[]) => void;
}

type EditorTab = 'crop' | 'filter' | 'adjust';

export function ImageEditorModal({ isOpen, onClose, onComplete }: ImageEditorModalProps) {
  const [images, setImages] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<EditorTab>('filter');
  const [editsMap, setEditsMap] = useState<Map<number, ImageEdits>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canvasRef, processAllImages } = useCanvasEditor();
  const { error: showToastError } = useToast();

  const currentEdits = editsMap.get(currentIndex) || {
    filter: 'original' as FilterType,
    crop: null,
    adjustments: { brightness: 0, contrast: 0, saturation: 0 },
    altText: ''
  };

  const updateCurrentEdits = (updates: Partial<ImageEdits>) => {
    const newMap = new Map(editsMap);
    newMap.set(currentIndex, { ...currentEdits, ...updates });
    setEditsMap(newMap);
  };

  const handleCropChange = (crop: CropArea | null) => {
    if (crop === null) {
      updateCurrentEdits({ crop: null });
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ratioValue = ASPECT_RATIO_VALUES[crop.aspectRatio];
        if (ratioValue) {
          let width = canvas.width;
          let height = canvas.height;
          
          if (width / height > ratioValue) {
            width = height * ratioValue;
          } else {
            height = width / ratioValue;
          }
          
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          updateCurrentEdits({
            crop: {
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(width),
              height: Math.round(height),
              aspectRatio: crop.aspectRatio
            }
          });
          return;
        }
      }
      updateCurrentEdits({ crop });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validation = validateImageFiles(files);

    if (!validation.valid) {
      showToastError(validation.error || 'Erro na validação');
      return;
    }

    setImages(files);
    setCurrentIndex(0);
    setEditsMap(new Map());
  };

  const handleComplete = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      const editedImages = await processAllImages(images, editsMap);
      onComplete(editedImages);
      onClose();
    } catch (error) {
      showToastError('Falha ao processar imagens');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger file input on mount if no images are loaded
  useEffect(() => {
    if (isOpen && images.length === 0) {
      fileInputRef.current?.click();
    }
  }, [isOpen, images.length]);

  // Handle canvas preview updates
  useEffect(() => {
    if (!isOpen || images.length === 0 || !canvasRef.current) return;
    
    let active = true;
    const file = images[currentIndex];
    
    const renderPreview = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Dynamic loading of images
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            if (!active) {
              URL.revokeObjectURL(url);
              return resolve();
            }
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
          };
          img.src = url;
        });

        if (!active) return;

        // Apply crop if exists
        if (currentEdits.crop) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const crop = currentEdits.crop;
            const imageData = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);
            canvas.width = crop.width;
            canvas.height = crop.height;
            ctx.putImageData(imageData, 0, 0);
          }
        }

        // Apply filter if exists
        if (currentEdits.filter !== 'original') {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, 0);
              ctx.filter = FILTER_PRESETS[currentEdits.filter];
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.filter = 'none';
            }
          }
        }

        // Apply adjustments if any
        const adj = currentEdits.adjustments;
        if (adj.brightness !== 0 || adj.contrast !== 0 || adj.saturation !== 0) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, 0);
              const brightness = 1 + adj.brightness / 100;
              const contrast = 1 + adj.contrast / 100;
              const saturation = 1 + adj.saturation / 100;
              ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.filter = 'none';
            }
          }
        }
      } catch (err) {
        console.error('Error rendering canvas preview:', err);
      }
    };

    renderPreview();

    return () => {
      active = false;
    };
  }, [
    isOpen,
    images,
    currentIndex,
    currentEdits.filter,
    currentEdits.crop,
    currentEdits.adjustments.brightness,
    currentEdits.adjustments.contrast,
    currentEdits.adjustments.saturation,
    canvasRef
  ]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex={60} title="Editar mídia">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 mb-4 rounded-full bg-bg-hover flex items-center justify-center text-3xl">
            📷
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Selecione arquivos para começar
          </h3>
          <p className="text-sm text-text-secondary mb-6">
            Compartilhe imagens na sua publicação.
          </p>
          <Button onClick={() => fileInputRef.current?.click()} variant="primary">
            Carregar a partir do computador
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-[75vh]">
          <ImageCarousel
            images={images}
            currentIndex={currentIndex}
            onNavigate={setCurrentIndex}
          />

          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Canvas Preview */}
            <div className="flex-1 flex items-center justify-center bg-bg-hover p-4 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Editor Sidebar */}
            <div className="w-80 border-l border-border-color flex flex-col h-full overflow-hidden bg-bg-card">
              {/* Tabs */}
              <div className="flex border-b border-border-color shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('crop')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'crop'
                      ? 'text-brand-blue border-b-2 border-brand-blue bg-brand-blue/5'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Recortar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('filter')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'filter'
                      ? 'text-brand-blue border-b-2 border-brand-blue bg-brand-blue/5'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Filtrar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'adjust'
                      ? 'text-brand-blue border-b-2 border-brand-blue bg-brand-blue/5'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Ajustar
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {activeTab === 'crop' && (
                  <CropTool
                    cropArea={currentEdits.crop}
                    onCropChange={handleCropChange}
                  />
                )}
                {activeTab === 'filter' && (
                  <FilterSelector
                    selected={currentEdits.filter}
                    onSelect={(filter) => updateCurrentEdits({ filter })}
                  />
                )}
                {activeTab === 'adjust' && (
                  <AdjustmentPanel
                    adjustments={currentEdits.adjustments}
                    onChange={(adjustments) => updateCurrentEdits({ adjustments })}
                  />
                )}
              </div>

              {/* Alt Text Editor */}
              <div className="shrink-0 border-t border-border-color bg-bg-card">
                <AltTextEditor
                  value={currentEdits.altText}
                  onChange={(altText) => updateCurrentEdits({ altText })}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border-color bg-bg-card shrink-0">
            <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isProcessing}
              variant="primary"
            >
              {isProcessing
                ? 'Processando...'
                : currentIndex === images.length - 1
                ? 'Concluir'
                : 'Avançar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
