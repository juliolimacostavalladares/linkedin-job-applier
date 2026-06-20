import { useRef, useCallback } from 'react';
import type { ImageEdits, EditedImage } from '../types/imageEditor';
import {
  loadImageToCanvas,
  applyCrop,
  applyFilter,
  applyAdjustments,
  generateBlob
} from '../utils/canvasProcessing';

export function useCanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(
    async (file: File, edits: ImageEdits): Promise<EditedImage> => {
      if (!canvasRef.current) {
        throw new Error('Canvas ref not initialized');
      }

      const canvas = canvasRef.current;

      // Load image
      await loadImageToCanvas(file, canvas);

      // Apply edits in order
      if (edits.crop) {
        applyCrop(canvas, edits.crop);
      }

      if (edits.filter !== 'original') {
        applyFilter(canvas, edits.filter);
      }

      if (
        edits.adjustments.brightness !== 0 ||
        edits.adjustments.contrast !== 0 ||
        edits.adjustments.saturation !== 0
      ) {
        applyAdjustments(canvas, edits.adjustments);
      }

      // Generate blob
      const blob = await generateBlob(canvas);

      // Generate thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.width = 150;
      thumbnailCanvas.height = 150;
      const ctx = thumbnailCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0, 150, 150);
      const thumbnail = thumbnailCanvas.toDataURL('image/jpeg', 0.7);

      return {
        blob,
        originalName: file.name,
        altText: edits.altText,
        thumbnail
      };
    },
    []
  );

  const processAllImages = useCallback(
    async (files: File[], editsMap: Map<number, ImageEdits>): Promise<EditedImage[]> => {
      const results: EditedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const edits = editsMap.get(i) || {
          filter: 'original' as const,
          crop: null,
          adjustments: { brightness: 0, contrast: 0, saturation: 0 },
          altText: ''
        };

        const result = await processImage(files[i], edits);
        results.push(result);
      }

      return results;
    },
    [processImage]
  );

  return { canvasRef, processImage, processAllImages };
}
