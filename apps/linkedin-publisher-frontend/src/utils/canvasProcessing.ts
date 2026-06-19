import type { FilterType, CropArea, Adjustments } from '../types/imageEditor';
import { FILTER_PRESETS } from '../types/imageEditor';

export function loadImageToCanvas(
  file: File,
  canvas: HTMLCanvasElement
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function applyCrop(
  canvas: HTMLCanvasElement,
  crop: CropArea
): void {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.putImageData(imageData, 0, 0);
}

export function applyFilter(
  canvas: HTMLCanvasElement,
  filter: FilterType
): void {
  if (filter === 'original') return;

  const ctx = canvas.getContext('2d')!;

  // Create temp canvas with current content
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(canvas, 0, 0);

  // Apply filter by redrawing
  ctx.filter = FILTER_PRESETS[filter];
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.filter = 'none';
}

export function applyAdjustments(
  canvas: HTMLCanvasElement,
  adj: Adjustments
): void {
  // Skip if no adjustments
  if (adj.brightness === 0 && adj.contrast === 0 && adj.saturation === 0) {
    return;
  }

  const ctx = canvas.getContext('2d')!;

  // Create temp canvas with current content
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.drawImage(canvas, 0, 0);

  // Build filter string
  const brightness = 1 + adj.brightness / 100;
  const contrast = 1 + adj.contrast / 100;
  const saturation = 1 + adj.saturation / 100;
  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

  // Apply by redrawing
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.filter = 'none';
}

export function generateBlob(
  canvas: HTMLCanvasElement
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate blob'));
      },
      'image/jpeg',
      0.9
    );
  });
}
