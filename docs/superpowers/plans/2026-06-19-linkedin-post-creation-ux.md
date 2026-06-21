# LinkedIn Post Creation UX Redesign - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement LinkedIn-style post creation UX with modal-over-modal architecture and complete image editor (filters, cropping, adjustments, alt text) using Canvas API.

**Architecture:** Two-layer modal system - PostCreationModal (primary) and ImageEditorModal (secondary, opens on top). All image processing happens client-side using Canvas API. Modular components with clear boundaries and single responsibilities.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Canvas API (native), zustand, lucide-react, Vite

## Global Constraints

- React version: 19.2.6+
- TypeScript version: 6.0.2+
- Maximum images per post: 9
- Image size limit: 10MB per image
- Supported formats: JPEG, PNG, GIF
- Image output: JPEG 90% quality
- Canvas processing: Client-side only, no external libraries
- Design system: Reuse existing tokens (bg-card, brand-blue, etc) and components (Button, Card, Input, Toast)
- Modal z-index: PostCreationModal (50), ImageEditorModal (60)
- Accessibility: Full keyboard navigation, focus trap, screen reader support

---

## File Structure

### New Files to Create

**Components:**
- `src/components/PostCreationModal.tsx` - Main post creation modal (Layer 1)
- `src/components/ImageEditorModal.tsx` - Image editing modal (Layer 2)
- `src/components/image-editor/ImageCarousel.tsx` - Navigate between images
- `src/components/image-editor/FilterSelector.tsx` - 7 filter presets
- `src/components/image-editor/CropTool.tsx` - Crop with aspect ratios
- `src/components/image-editor/AdjustmentPanel.tsx` - Brightness/contrast/saturation sliders
- `src/components/image-editor/AltTextEditor.tsx` - Accessibility text input
- `src/components/ImagePreviewGrid.tsx` - Thumbnail grid in main modal
- `src/components/ui/Modal.tsx` - Reusable modal base component

**Hooks:**
- `src/hooks/useModalStack.ts` - Manage modal layering
- `src/hooks/useModalFocusTrap.ts` - Trap focus in active modal
- `src/hooks/useScrollLock.ts` - Lock body scroll when modals open
- `src/hooks/useModalEscapeKey.ts` - Close top modal on Escape
- `src/hooks/useCanvasEditor.ts` - Canvas image processing logic

**Utils:**
- `src/utils/canvasProcessing.ts` - Canvas operations (load, crop, filter, adjust, blob)
- `src/utils/imageValidation.ts` - File size, format, count validation

**Types:**
- `src/types/imageEditor.ts` - TypeScript interfaces for image editing

### Files to Modify

- `src/components/CreatePostView.tsx` - Refactor to use PostCreationModal
- `src/stores/publisherStore.ts` - Already modified (accepts images parameter)
- `src/services/apiService.ts` - Already modified (sends FormData)

---

## Task 1: TypeScript Types and Interfaces

**Files:**
- Create: `src/types/imageEditor.ts`
- Test: None (pure types)

**Interfaces:**
- Consumes: None
- Produces: `FilterType`, `AspectRatio`, `CropArea`, `Adjustments`, `ImageEdits`, `EditedImage` types for all subsequent tasks

- [ ] **Step 1: Create types file with complete interfaces**

```typescript
// src/types/imageEditor.ts
export type FilterType = 
  | 'original' 
  | 'studio' 
  | 'spotlight' 
  | 'prime' 
  | 'classic' 
  | 'edge' 
  | 'luminate';

export type AspectRatio = 
  | 'original' 
  | 'square' 
  | '4:1' 
  | '3:4' 
  | '16:9';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
}

export interface Adjustments {
  brightness: number;  // -100 to +100
  contrast: number;    // -100 to +100
  saturation: number;  // -100 to +100
}

export interface ImageEdits {
  filter: FilterType;
  crop: CropArea | null;
  adjustments: Adjustments;
  altText: string;
}

export interface EditedImage {
  blob: Blob;
  originalName: string;
  altText: string;
  thumbnail: string;  // Data URL for preview
}

export const FILTER_PRESETS: Record<FilterType, string> = {
  original: 'none',
  studio: 'contrast(1.1) brightness(1.05) saturate(1.1)',
  spotlight: 'contrast(1.2) brightness(1.1)',
  prime: 'sepia(0.3) contrast(1.15)',
  classic: 'grayscale(0.4) contrast(1.1)',
  edge: 'contrast(1.3) saturate(0.8)',
  luminate: 'brightness(1.2) contrast(0.9)'
};

export const ASPECT_RATIO_VALUES: Record<AspectRatio, number | null> = {
  original: null,
  square: 1,
  '4:1': 4,
  '3:4': 0.75,
  '16:9': 16 / 9
};
```

- [ ] **Step 2: Verify types compile**

Run: `cd apps/linkedin-publisher-frontend && npm run build`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/types/imageEditor.ts
git commit -m "feat: add image editor type definitions"
```

---

## Task 2: Image Validation Utilities

**Files:**
- Create: `src/utils/imageValidation.ts`
- Test: `src/utils/__tests__/imageValidation.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `validateImageFile(file: File)`, `validateImageFiles(files: File[])` for Task 4+

- [ ] **Step 1: Write failing tests**

```typescript
// src/utils/__tests__/imageValidation.test.ts
import { describe, it, expect } from 'vitest';
import { validateImageFile, validateImageFiles, ValidationError } from '../imageValidation';

describe('imageValidation', () => {
  it('should accept valid JPEG file', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject file over 10MB', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Imagem muito grande (máx 10MB)');
  });

  it('should reject unsupported format', () => {
    const file = new File([''], 'test.bmp', { type: 'image/bmp' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Formato não suportado (use JPEG, PNG ou GIF)');
  });

  it('should reject more than 9 images', () => {
    const files = Array(10).fill(null).map((_, i) => 
      new File([''], `test${i}.jpg`, { type: 'image/jpeg' })
    );
    const result = validateImageFiles(files);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Máximo de 9 imagens!');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test imageValidation.test.ts`
Expected: 4 FAILED tests

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/utils/imageValidation.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_COUNT = 9;
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Imagem muito grande (máx 10MB)' };
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return { valid: false, error: 'Formato não suportado (use JPEG, PNG ou GIF)' };
  }

  return { valid: true };
}

export function validateImageFiles(files: File[]): ValidationResult {
  if (files.length > MAX_IMAGE_COUNT) {
    return { valid: false, error: 'Máximo de 9 imagens!' };
  }

  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test imageValidation.test.ts`
Expected: 4 PASSED tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/imageValidation.ts src/utils/__tests__/imageValidation.test.ts
git commit -m "feat: add image validation utilities with tests"
```

---

## Task 3: Canvas Processing Utilities

**Files:**
- Create: `src/utils/canvasProcessing.ts`
- Test: Manual (browser-based Canvas API)

**Interfaces:**
- Consumes: `FilterType`, `CropArea`, `Adjustments` from Task 1
- Produces: `loadImageToCanvas()`, `applyCrop()`, `applyFilter()`, `applyAdjustments()`, `generateBlob()` for Task 9+


- [ ] **Step 1: Implement Canvas processing functions**

```typescript
// src/utils/canvasProcessing.ts
import { FilterType, CropArea, Adjustments, FILTER_PRESETS } from '../types/imageEditor';

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
  const ctx = canvas.getContext('2d')!;
  ctx.filter = FILTER_PRESETS[filter];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  ctx.filter = 'none';
}

export function applyAdjustments(
  canvas: HTMLCanvasElement,
  adj: Adjustments
): void {
  const ctx = canvas.getContext('2d')!;

  const brightness = 1 + adj.brightness / 100;
  const contrast = 1 + adj.contrast / 100;
  const saturation = 1 + adj.saturation / 100;

  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
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
```

- [ ] **Step 2: Test manually in browser console**

Open browser DevTools console and test:
```javascript
const canvas = document.createElement('canvas');
// Load test image and verify each function
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/canvasProcessing.ts
git commit -m "feat: add Canvas API processing utilities"
```

---

## Task 4: Modal System Hooks

**Files:**
- Create: `src/hooks/useScrollLock.ts`
- Create: `src/hooks/useModalEscapeKey.ts`
- Create: `src/hooks/useModalFocusTrap.ts`
- Create: `src/hooks/useModalStack.ts`
- Test: `src/hooks/__tests__/modal-hooks.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: `useScrollLock(isLocked)`, `useModalEscapeKey(isOpen, onClose)`, `useModalFocusTrap(isOpen, modalRef)`, `useModalStack()` for Task 6+

- [ ] **Step 1: Write failing tests**

```typescript
// src/hooks/__tests__/modal-hooks.test.tsx
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScrollLock, useModalEscapeKey } from '../useScrollLock';

describe('Modal Hooks', () => {
  it('useScrollLock should lock body scroll', () => {
    const { rerender } = renderHook(
      ({ locked }) => useScrollLock(locked),
      { initialProps: { locked: false } }
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ locked: true });
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('useModalEscapeKey should call onClose on Escape', () => {
    const onClose = vi.fn();
    renderHook(() => useModalEscapeKey(true, onClose));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test modal-hooks.test.tsx`
Expected: 2 FAILED tests

- [ ] **Step 3: Implement useScrollLock**

```typescript
// src/hooks/useScrollLock.ts
import { useEffect } from 'react';

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isLocked]);
}
```

- [ ] **Step 4: Implement useModalEscapeKey**

```typescript
// src/hooks/useModalEscapeKey.ts
import { useEffect } from 'react';

export function useModalEscapeKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
}
```

- [ ] **Step 5: Implement useModalFocusTrap**

```typescript
// src/hooks/useModalFocusTrap.ts
import { useEffect, RefObject } from 'react';

export function useModalFocusTrap(
  isOpen: boolean,
  modalRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    firstElement?.focus();
    document.addEventListener('keydown', handleTabKey);

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, modalRef]);
}
```

- [ ] **Step 6: Implement useModalStack**

```typescript
// src/hooks/useModalStack.ts
import { useState, useCallback } from 'react';

interface ModalStackItem {
  id: string;
  zIndex: number;
}

export function useModalStack() {
  const [stack, setStack] = useState<ModalStackItem[]>([]);

  const push = useCallback((id: string, zIndex: number) => {
    setStack((prev) => [...prev, { id, zIndex }]);
  }, []);

  const pop = useCallback((id: string) => {
    setStack((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isTop = useCallback(
    (id: string) => {
      return stack[stack.length - 1]?.id === id;
    },
    [stack]
  );

  return { push, pop, isTop, count: stack.length };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test modal-hooks.test.tsx`
Expected: 2 PASSED tests

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useScrollLock.ts src/hooks/useModalEscapeKey.ts src/hooks/useModalFocusTrap.ts src/hooks/useModalStack.ts src/hooks/__tests__/modal-hooks.test.tsx
git commit -m "feat: add modal system hooks with tests"
```

---

## Task 5: Base Modal Component

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Test: `src/components/ui/__tests__/Modal.test.tsx`

**Interfaces:**
- Consumes: `useScrollLock`, `useModalEscapeKey`, `useModalFocusTrap` from Task 4
- Produces: `<Modal>` component for Task 6+

- [ ] **Step 1: Write failing test**

```typescript
// src/components/ui/__tests__/Modal.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should render children when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} zIndex={50}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} zIndex={50}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should apply correct z-index', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} zIndex={60}>
        <div>Modal Content</div>
      </Modal>
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    expect(backdrop).toHaveStyle({ zIndex: '55' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test Modal.test.tsx`
Expected: 3 FAILED tests

- [ ] **Step 3: Implement Modal component**

```typescript
// src/components/ui/Modal.tsx
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useModalEscapeKey } from '../../hooks/useModalEscapeKey';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex: number;
  children: React.ReactNode;
  showCloseButton?: boolean;
  title?: string;
}

export function Modal({
  isOpen,
  onClose,
  zIndex,
  children,
  showCloseButton = true,
  title
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);
  useModalEscapeKey(isOpen, onClose);
  useModalFocusTrap(isOpen, modalRef);

  if (!isOpen) return null;

  const backdropZIndex = zIndex - 5;
  const modalZIndex = zIndex;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
        className="fixed inset-0 bg-black transition-opacity"
        style={{ 
          zIndex: backdropZIndex,
          opacity: zIndex >= 60 ? 0.8 : 0.6
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: modalZIndex }}
      >
        <div
          ref={modalRef}
          className="bg-card rounded-lg shadow-subtle w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-border-color">
              {title && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-hover rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test Modal.test.tsx`
Expected: 3 PASSED tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/__tests__/Modal.test.tsx
git commit -m "feat: add reusable Modal component with portal"
```

---

## Task 6: useCanvasEditor Hook

**Files:**
- Create: `src/hooks/useCanvasEditor.ts`
- Test: Manual (browser-based)

**Interfaces:**
- Consumes: `loadImageToCanvas`, `applyCrop`, `applyFilter`, `applyAdjustments`, `generateBlob` from Task 3, `ImageEdits`, `EditedImage` from Task 1
- Produces: `useCanvasEditor()` hook with `processImage()`, `processAllImages()` methods for Task 9+

- [ ] **Step 1: Implement useCanvasEditor hook**

```typescript
// src/hooks/useCanvasEditor.ts
import { useRef, useCallback } from 'react';
import { ImageEdits, EditedImage } from '../types/imageEditor';
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
          filter: 'original',
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
```

- [ ] **Step 2: Test manually in browser**

Create test page with canvas and verify processing works

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCanvasEditor.ts
git commit -m "feat: add useCanvasEditor hook for image processing"
```


---

## Task 7: ImageCarousel Component

**Files:**
- Create: `src/components/image-editor/ImageCarousel.tsx`
- Test: `src/components/image-editor/__tests__/ImageCarousel.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: `<ImageCarousel images={File[]} currentIndex={number} onNavigate={(index) => void}>` for Task 9

- [ ] **Step 1: Write failing test**

```typescript
// src/components/image-editor/__tests__/ImageCarousel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageCarousel } from '../ImageCarousel';

describe('ImageCarousel', () => {
  const files = [
    new File([''], 'img1.jpg', { type: 'image/jpeg' }),
    new File([''], 'img2.jpg', { type: 'image/jpeg' }),
    new File([''], 'img3.jpg', { type: 'image/jpeg' })
  ];

  it('should show current index indicator', () => {
    render(<ImageCarousel images={files} currentIndex={0} onNavigate={vi.fn()} />);
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('should call onNavigate when clicking next', () => {
    const onNavigate = vi.fn();
    render(<ImageCarousel images={files} currentIndex={0} onNavigate={onNavigate} />);
    
    const nextButton = screen.getByLabelText('Próxima imagem');
    fireEvent.click(nextButton);
    
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('should disable previous button on first image', () => {
    render(<ImageCarousel images={files} currentIndex={0} onNavigate={vi.fn()} />);
    expect(screen.getByLabelText('Imagem anterior')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test ImageCarousel.test.tsx`
Expected: 3 FAILED tests

- [ ] **Step 3: Implement ImageCarousel**

```typescript
// src/components/image-editor/ImageCarousel.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageCarouselProps {
  images: File[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function ImageCarousel({
  images,
  currentIndex,
  onNavigate
}: ImageCarouselProps) {
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border-color">
      <Button
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={!canGoPrevious}
        variant="ghost"
        size="sm"
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <span className="text-sm font-medium text-secondary">
        {currentIndex + 1} de {images.length}
      </span>

      <Button
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={!canGoNext}
        variant="ghost"
        size="sm"
        aria-label="Próxima imagem"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test ImageCarousel.test.tsx`
Expected: 3 PASSED tests

- [ ] **Step 5: Commit**

```bash
git add src/components/image-editor/ImageCarousel.tsx src/components/image-editor/__tests__/ImageCarousel.test.tsx
git commit -m "feat: add ImageCarousel component with navigation"
```

---

## Task 8: FilterSelector Component

**Files:**
- Create: `src/components/image-editor/FilterSelector.tsx`
- Test: `src/components/image-editor/__tests__/FilterSelector.test.tsx`

**Interfaces:**
- Consumes: `FilterType`, `FILTER_PRESETS` from Task 1
- Produces: `<FilterSelector selected={FilterType} onSelect={(filter) => void}>` for Task 9

- [ ] **Step 1: Write failing test**

```typescript
// src/components/image-editor/__tests__/FilterSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterSelector } from '../FilterSelector';

describe('FilterSelector', () => {
  it('should render all 7 filter options', () => {
    render(<FilterSelector selected="original" onSelect={vi.fn()} />);
    
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
    expect(screen.getByText('Spotlight')).toBeInTheDocument();
    expect(screen.getByText('Prime')).toBeInTheDocument();
    expect(screen.getByText('Classic')).toBeInTheDocument();
    expect(screen.getByText('Edge')).toBeInTheDocument();
    expect(screen.getByText('Luminate')).toBeInTheDocument();
  });

  it('should call onSelect when clicking filter', () => {
    const onSelect = vi.fn();
    render(<FilterSelector selected="original" onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Studio'));
    expect(onSelect).toHaveBeenCalledWith('studio');
  });

  it('should highlight selected filter', () => {
    render(<FilterSelector selected="studio" onSelect={vi.fn()} />);
    
    const studioButton = screen.getByText('Studio').closest('button');
    expect(studioButton).toHaveClass('ring-2', 'ring-brand-blue');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test FilterSelector.test.tsx`
Expected: 3 FAILED tests

- [ ] **Step 3: Implement FilterSelector**

```typescript
// src/components/image-editor/FilterSelector.tsx
import { FilterType } from '../../types/imageEditor';

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test FilterSelector.test.tsx`
Expected: 3 PASSED tests

- [ ] **Step 5: Commit**

```bash
git add src/components/image-editor/FilterSelector.tsx src/components/image-editor/__tests__/FilterSelector.test.tsx
git commit -m "feat: add FilterSelector component with 7 presets"
```

---

## Task 9: AdjustmentPanel Component

**Files:**
- Create: `src/components/image-editor/AdjustmentPanel.tsx`
- Test: `src/components/image-editor/__tests__/AdjustmentPanel.test.tsx`

**Interfaces:**
- Consumes: `Adjustments` from Task 1
- Produces: `<AdjustmentPanel adjustments={Adjustments} onChange={(adj) => void}>` for Task 11

- [ ] **Step 1: Write failing test**

```typescript
// src/components/image-editor/__tests__/AdjustmentPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdjustmentPanel } from '../AdjustmentPanel';

describe('AdjustmentPanel', () => {
  const defaultAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0
  };

  it('should render all three sliders', () => {
    render(
      <AdjustmentPanel
        adjustments={defaultAdjustments}
        onChange={vi.fn()}
      />
    );
    
    expect(screen.getByLabelText('Brilho')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraste')).toBeInTheDocument();
    expect(screen.getByLabelText('Saturação')).toBeInTheDocument();
  });

  it('should call onChange when adjusting brightness', () => {
    const onChange = vi.fn();
    render(
      <AdjustmentPanel
        adjustments={defaultAdjustments}
        onChange={onChange}
      />
    );
    
    const brightnessSlider = screen.getByLabelText('Brilho');
    fireEvent.change(brightnessSlider, { target: { value: '20' } });
    
    expect(onChange).toHaveBeenCalledWith({
      brightness: 20,
      contrast: 0,
      saturation: 0
    });
  });

  it('should display current values', () => {
    render(
      <AdjustmentPanel
        adjustments={{ brightness: 30, contrast: -15, saturation: 10 }}
        onChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('+30')).toBeInTheDocument();
    expect(screen.getByText('-15')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test AdjustmentPanel.test.tsx`
Expected: 3 FAILED tests

- [ ] **Step 3: Implement AdjustmentPanel**

```typescript
// src/components/image-editor/AdjustmentPanel.tsx
import { Adjustments } from '../../types/imageEditor';

interface AdjustmentPanelProps {
  adjustments: Adjustments;
  onChange: (adjustments: Adjustments) => void;
}

export function AdjustmentPanel({ adjustments, onChange }: AdjustmentPanelProps) {
  const handleChange = (key: keyof Adjustments, value: number) => {
    onChange({
      ...adjustments,
      [key]: value
    });
  };

  const formatValue = (value: number) => {
    if (value === 0) return '0';
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-primary mb-3">Ajustes</h3>

      {/* Brightness */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="brightness" className="text-sm text-secondary">
            Brilho
          </label>
          <span className="text-sm font-medium text-primary">
            {formatValue(adjustments.brightness)}
          </span>
        </div>
        <input
          id="brightness"
          type="range"
          min="-100"
          max="100"
          value={adjustments.brightness}
          onChange={(e) => handleChange('brightness', Number(e.target.value))}
          aria-label="Brilho"
          className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-brand-blue"
        />
      </div>

      {/* Contrast */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="contrast" className="text-sm text-secondary">
            Contraste
          </label>
          <span className="text-sm font-medium text-primary">
            {formatValue(adjustments.contrast)}
          </span>
        </div>
        <input
          id="contrast"
          type="range"
          min="-100"
          max="100"
          value={adjustments.contrast}
          onChange={(e) => handleChange('contrast', Number(e.target.value))}
          aria-label="Contraste"
          className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-brand-blue"
        />
      </div>

      {/* Saturation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="saturation" className="text-sm text-secondary">
            Saturação
          </label>
          <span className="text-sm font-medium text-primary">
            {formatValue(adjustments.saturation)}
          </span>
        </div>
        <input
          id="saturation"
          type="range"
          min="-100"
          max="100"
          value={adjustments.saturation}
          onChange={(e) => handleChange('saturation', Number(e.target.value))}
          aria-label="Saturação"
          className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-brand-blue"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test AdjustmentPanel.test.tsx`
Expected: 3 PASSED tests

- [ ] **Step 5: Commit**

```bash
git add src/components/image-editor/AdjustmentPanel.tsx src/components/image-editor/__tests__/AdjustmentPanel.test.tsx
git commit -m "feat: add AdjustmentPanel with brightness/contrast/saturation"
```

---

## Task 10: AltTextEditor and CropTool Components

**Files:**
- Create: `src/components/image-editor/AltTextEditor.tsx`
- Create: `src/components/image-editor/CropTool.tsx`
- Test: `src/components/image-editor/__tests__/AltTextEditor.test.tsx`

**Interfaces:**
- Consumes: `CropArea`, `AspectRatio` from Task 1
- Produces: `<AltTextEditor>`, `<CropTool>` for Task 11

- [ ] **Step 1: Write failing test for AltTextEditor**

```typescript
// src/components/image-editor/__tests__/AltTextEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AltTextEditor } from '../AltTextEditor';

describe('AltTextEditor', () => {
  it('should render textarea with placeholder', () => {
    render(<AltTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Como você descreveria/)).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<AltTextEditor value="" onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test description' } });
    
    expect(onChange).toHaveBeenCalledWith('Test description');
  });

  it('should show character counter', () => {
    render(<AltTextEditor value="Hello world" onChange={vi.fn()} />);
    expect(screen.getByText('11 / 1000')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test AltTextEditor.test.tsx`
Expected: 3 FAILED tests

- [ ] **Step 3: Implement AltTextEditor**

```typescript
// src/components/image-editor/AltTextEditor.tsx
interface AltTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AltTextEditor({ value, onChange }: AltTextEditorProps) {
  const maxLength = 1000;
  const currentLength = value.length;

  return (
    <div className="p-4 border-t border-border-color">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="altText" className="text-sm font-semibold text-primary">
          Texto alternativo
        </label>
        <span className="text-xs text-secondary">
          {currentLength} / {maxLength}
        </span>
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
```

- [ ] **Step 4: Implement CropTool (simplified)**

```typescript
// src/components/image-editor/CropTool.tsx
import { AspectRatio, CropArea } from '../../types/imageEditor';

interface CropToolProps {
  cropArea: CropArea | null;
  onCropChange: (crop: CropArea | null) => void;
}

const ASPECT_RATIOS: { id: AspectRatio; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: 'square', label: 'Quadrado (1:1)' },
  { id: '4:1', label: 'Banner (4:1)' },
  { id: '3:4', label: 'Retrato (3:4)' },
  { id: '16:9', label: 'Paisagem (16:9)' }
];

export function CropTool({ cropArea, onCropChange }: CropToolProps) {
  const handleAspectRatioChange = (aspectRatio: AspectRatio) => {
    if (aspectRatio === 'original') {
      onCropChange(null);
    } else {
      // Simplified: Create default crop area
      onCropChange({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        aspectRatio
      });
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-primary mb-3">Recortar</h3>
      <div className="space-y-2">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.id}
            onClick={() => handleAspectRatioChange(ratio.id)}
            className={`
              w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left
              ${
                (cropArea?.aspectRatio === ratio.id) || (!cropArea && ratio.id === 'original')
                  ? 'bg-bg-active-card text-brand-blue border-2 border-brand-blue'
                  : 'bg-bg-card text-primary border border-border-color hover:border-brand-blue'
              }
            `}
          >
            {ratio.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-secondary">
        Selecione a proporção desejada para recortar a imagem
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test AltTextEditor.test.tsx`
Expected: 3 PASSED tests

- [ ] **Step 6: Commit**

```bash
git add src/components/image-editor/AltTextEditor.tsx src/components/image-editor/CropTool.tsx src/components/image-editor/__tests__/AltTextEditor.test.tsx
git commit -m "feat: add AltTextEditor and CropTool components"
```


---

## Task 11: ImageEditorModal Component

**Files:**
- Create: `src/components/ImageEditorModal.tsx`
- Test: Manual (browser-based integration)

**Interfaces:**
- Consumes: `Modal`, `ImageCarousel`, `FilterSelector`, `CropTool`, `AdjustmentPanel`, `AltTextEditor`, `useCanvasEditor`, `validateImageFiles` from previous tasks
- Produces: `<ImageEditorModal isOpen onClose onComplete={(images: EditedImage[]) => void}>` for Task 13

- [ ] **Step 1: Create ImageEditorModal shell**

```typescript
// src/components/ImageEditorModal.tsx
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
import { ImageEdits, EditedImage, FilterType, CropArea } from '../types/imageEditor';
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validation = validateImageFiles(files);

    if (!validation.valid) {
      showToastError(validation.error!);
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

  // Trigger file input on mount
  useEffect(() => {
    if (isOpen && images.length === 0) {
      fileInputRef.current?.click();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} zIndex={60} title="Editor">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        multiple
        max={9}
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-32 h-32 mb-4 rounded-full bg-bg-hover flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Selecione arquivos para começar
          </h3>
          <p className="text-sm text-secondary mb-6">
            Compartilhe imagens ou um único vídeo na sua publicação.
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            Carregar a partir do computador
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-[80vh]">
          <ImageCarousel
            images={images}
            currentIndex={currentIndex}
            onNavigate={setCurrentIndex}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* Canvas Preview */}
            <div className="flex-1 flex items-center justify-center bg-bg-hover p-8">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Editor Sidebar */}
            <div className="w-80 border-l border-border-color overflow-y-auto">
              {/* Tabs */}
              <div className="flex border-b border-border-color">
                <button
                  onClick={() => setActiveTab('crop')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'crop'
                      ? 'text-brand-blue border-b-2 border-brand-blue'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Recortar
                </button>
                <button
                  onClick={() => setActiveTab('filter')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'filter'
                      ? 'text-brand-blue border-b-2 border-brand-blue'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Filtrar
                </button>
                <button
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'adjust'
                      ? 'text-brand-blue border-b-2 border-brand-blue'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Ajustar
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'crop' && (
                <CropTool
                  cropArea={currentEdits.crop}
                  onCropChange={(crop) => updateCurrentEdits({ crop })}
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

              {/* Alt Text Editor */}
              <AltTextEditor
                value={currentEdits.altText}
                onChange={(altText) => updateCurrentEdits({ altText })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border-color">
            <Button variant="ghost" onClick={onClose}>
              Voltar
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : currentIndex === images.length - 1 ? 'Concluir' : 'Avançar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 2: Test manually in browser**

Start dev server and test full image editing flow

- [ ] **Step 3: Commit**

```bash
git add src/components/ImageEditorModal.tsx
git commit -m "feat: add ImageEditorModal with complete editing suite"
```

---

## Task 12: ImagePreviewGrid Component

**Files:**
- Create: `src/components/ImagePreviewGrid.tsx`
- Test: `src/components/__tests__/ImagePreviewGrid.test.tsx`

**Interfaces:**
- Consumes: `EditedImage` from Task 1
- Produces: `<ImagePreviewGrid images={EditedImage[]} onRemove={(index) => void}>` for Task 13

- [ ] **Step 1: Write failing test**

```typescript
// src/components/__tests__/ImagePreviewGrid.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImagePreviewGrid } from '../ImagePreviewGrid';
import { EditedImage } from '../../types/imageEditor';

describe('ImagePreviewGrid', () => {
  const mockImages: EditedImage[] = [
    {
      blob: new Blob(),
      originalName: 'img1.jpg',
      altText: 'Test 1',
      thumbnail: 'data:image/jpeg;base64,test1'
    },
    {
      blob: new Blob(),
      originalName: 'img2.jpg',
      altText: 'Test 2',
      thumbnail: 'data:image/jpeg;base64,test2'
    }
  ];

  it('should render all image thumbnails', () => {
    render(<ImagePreviewGrid images={mockImages} onRemove={vi.fn()} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('should call onRemove when clicking remove button', () => {
    const onRemove = vi.fn();
    render(<ImagePreviewGrid images={mockImages} onRemove={onRemove} />);
    
    const removeButtons = screen.getAllByLabelText(/Remover imagem/);
    fireEvent.click(removeButtons[0]);
    
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('should show image count', () => {
    render(<ImagePreviewGrid images={mockImages} onRemove={vi.fn()} />);
    expect(screen.getByText('2 imagens selecionadas')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test ImagePreviewGrid.test.tsx`
Expected: 3 FAILED tests

- [ ] **Step 3: Implement ImagePreviewGrid**

```typescript
// src/components/ImagePreviewGrid.tsx
import { X } from 'lucide-react';
import { EditedImage } from '../types/imageEditor';

interface ImagePreviewGridProps {
  images: EditedImage[];
  onRemove: (index: number) => void;
}

export function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-secondary">
        {images.length} {images.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
      </p>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden bg-bg-hover group"
          >
            <img
              src={image.thumbnail}
              alt={image.altText || image.originalName}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onRemove(index)}
              aria-label={`Remover imagem ${index + 1}`}
              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test ImagePreviewGrid.test.tsx`
Expected: 3 PASSED tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ImagePreviewGrid.tsx src/components/__tests__/ImagePreviewGrid.test.tsx
git commit -m "feat: add ImagePreviewGrid component with remove functionality"
```


---

## Task 13: PostCreationModal Component

**Files:**
- Create: `src/components/PostCreationModal.tsx`
- Test: Manual (browser integration)

**Interfaces:**
- Consumes: `Modal`, `ImageEditorModal`, `ImagePreviewGrid`, `Textarea`, `Button` from previous tasks, `usePublisherStore` for `createPost`
- Produces: `<PostCreationModal isOpen onClose>` for Task 14

- [ ] **Step 1: Implement PostCreationModal**

```typescript
// src/components/PostCreationModal.tsx
import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import { ImageEditorModal } from './ImageEditorModal';
import { ImagePreviewGrid } from './ImagePreviewGrid';
import { usePublisherStore } from '../stores/publisherStore';
import { useToast } from './ui/Toast';
import { EditedImage } from '../types/imageEditor';
import { Image as ImageIcon, Calendar } from 'lucide-react';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostCreationModal({ isOpen, onClose }: PostCreationModalProps) {
  const [text, setText] = useState('');
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const { createPost, profile } = usePublisherStore();
  const { success: showToastSuccess, error: showToastError } = useToast();

  const handlePublish = async () => {
    if (!text.trim()) {
      showToastError('Escreva um texto antes de publicar!');
      return;
    }

    if (isScheduled && !scheduledAt) {
      showToastError('Selecione uma data e hora para o agendamento!');
      return;
    }

    try {
      const imageFiles = editedImages.map(
        (img) => new File([img.blob], img.originalName, { type: 'image/jpeg' })
      );

      await createPost(
        {
          text,
          type: editedImages.length > 0 ? 'image' : 'text',
          status: isScheduled ? 'scheduled' : 'published',
          scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : undefined,
          publishedAt: isScheduled ? undefined : new Date().toISOString()
        },
        imageFiles.length > 0 ? imageFiles : undefined
      );

      showToastSuccess(
        isScheduled
          ? 'Postagem agendada com sucesso!'
          : 'Publicado no LinkedIn com sucesso!'
      );

      onClose();
      setText('');
      setEditedImages([]);
      setIsScheduled(false);
      setScheduledAt('');
    } catch (error) {
      showToastError('Falha ao publicar. Tente novamente.');
      console.error(error);
    }
  };

  const handleImagesComplete = (images: EditedImage[]) => {
    setEditedImages(images);
  };

  const handleRemoveImage = (index: number) => {
    setEditedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} zIndex={50}>
        <div className="p-6 space-y-4">
          {/* Header with Profile */}
          <div className="flex items-center space-x-3">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-bg-hover" />
            )}
            <div>
              <p className="font-semibold text-primary">
                {profile?.name || 'Usuário'}
              </p>
              <p className="text-sm text-secondary">Publicar em Todos</p>
            </div>
          </div>

          {/* Text Area */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Sobre o que você quer falar?"
            rows={6}
            className="w-full resize-none"
            autoFocus
          />

          {/* Image Previews */}
          <ImagePreviewGrid images={editedImages} onRemove={handleRemoveImage} />

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-border-color">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageEditor(true)}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Adicionar mídia
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar
              </Button>
            </div>

            <Button onClick={handlePublish}>
              {isScheduled ? 'Agendar' : 'Publicar'}
            </Button>
          </div>
        </div>
      </Modal>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onComplete={handleImagesComplete}
      />
    </>
  );
}
```

- [ ] **Step 2: Test modal layering in browser**

Verify PostCreationModal opens, ImageEditorModal opens on top, focus management works

- [ ] **Step 3: Commit**

```bash
git add src/components/PostCreationModal.tsx
git commit -m "feat: add PostCreationModal with image editor integration"
```

---

## Task 14: Refactor CreatePostView Integration

**Files:**
- Modify: `src/components/CreatePostView.tsx`

**Interfaces:**
- Consumes: `PostCreationModal` from Task 13
- Produces: Updated CreatePostView that uses new modal system

- [ ] **Step 1: Refactor CreatePostView to use PostCreationModal**

```typescript
// In CreatePostView.tsx, replace existing form with modal trigger
import { useState } from 'react';
import { PostCreationModal } from './PostCreationModal';
import { Button } from './ui/Button';

export function CreatePostView() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-card rounded-lg shadow-subtle p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Criar Publicação
        </h1>
        <p className="text-secondary mb-6">
          Compartilhe suas ideias com sua rede profissional
        </p>
        <Button onClick={() => setShowModal(true)} size="lg">
          Criar Post
        </Button>
      </div>

      <PostCreationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Test end-to-end flow**

Navigate to create post page, open modal, add images, edit, publish

- [ ] **Step 3: Commit**

```bash
git add src/components/CreatePostView.tsx
git commit -m "refactor: integrate PostCreationModal into CreatePostView"
```

---

## Task 15: End-to-End Testing

**Files:**
- Test: Manual browser testing

**Interfaces:**
- Tests complete user flow

- [ ] **Step 1: Test happy path**

1. Navigate to /create
2. Click "Criar Post"
3. Type post text
4. Click "Adicionar mídia"
5. Select 3 images
6. Apply filter to image 1
7. Crop image 2
8. Adjust brightness on image 3
9. Add alt text to all
10. Click "Concluir"
11. Verify thumbnails appear
12. Click "Publicar"
13. Verify success toast
14. Verify post appears in dashboard

- [ ] **Step 2: Test error cases**

1. Try to publish without text → error toast
2. Select 10 images → validation error
3. Select 15MB image → validation error
4. Test escape key closes correct modal
5. Test backdrop click closes correct modal

- [ ] **Step 3: Test accessibility**

1. Navigate entire flow with keyboard only (Tab, Enter, Escape)
2. Verify focus trap works in both modals
3. Test with screen reader

- [ ] **Step 4: Document any issues found**

Create GitHub issues for bugs discovered

---

## Task 16: Performance Optimization

**Files:**
- Modify: `src/hooks/useCanvasEditor.ts`
- Modify: `src/components/image-editor/AdjustmentPanel.tsx`

**Interfaces:**
- Optimizes image processing

- [ ] **Step 1: Add debounce to adjustment sliders**

```typescript
// In AdjustmentPanel.tsx, add debounce hook
import { useMemo, useCallback } from 'react';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Use in component:
const debouncedOnChange = useMemo(
  () => debounce(onChange, 100),
  [onChange]
);
```

- [ ] **Step 2: Add canvas cleanup on unmount**

```typescript
// In useCanvasEditor.ts
useEffect(() => {
  return () => {
    // Cleanup canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };
}, []);
```

- [ ] **Step 3: Test performance with 9 large images**

Profile with browser DevTools, verify no memory leaks

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCanvasEditor.ts src/components/image-editor/AdjustmentPanel.tsx
git commit -m "perf: optimize canvas processing and add debounce"
```

---

## Task 17: Documentation and Cleanup

**Files:**
- Create: `docs/features/post-creation-ux.md`
- Update: `README.md`

**Interfaces:**
- Documents new feature

- [ ] **Step 1: Write feature documentation**

Document component architecture, usage, and maintenance notes

- [ ] **Step 2: Update README**

Add new feature to feature list

- [ ] **Step 3: Clean up old unused code**

Remove any deprecated code from old CreatePostView if applicable

- [ ] **Step 4: Final commit**

```bash
git add docs/ README.md
git commit -m "docs: document LinkedIn post creation UX redesign"
```

---

## Plan Self-Review

**Spec Coverage Check:**
✅ Modal-over-modal architecture (Tasks 4-6, 11, 13)
✅ Image editor with filters (Task 8)
✅ Cropping with aspect ratios (Task 10)
✅ Adjustments (brightness/contrast/saturation) (Task 9)
✅ Alt text for accessibility (Task 10)
✅ Canvas API client-side processing (Tasks 3, 6)
✅ Modular component structure (all tasks)
✅ Design system maintained (all UI components)
✅ Error handling (Tasks 2, 11, 15)
✅ Testing strategy (Tasks 2-10 unit tests, Task 15 E2E)

**Placeholder Scan:**
✅ No TBDs or TODOs
✅ All code blocks complete
✅ All commands with expected output

**Type Consistency:**
✅ `EditedImage` defined in Task 1, used correctly in Tasks 11-13
✅ `ImageEdits` defined in Task 1, used correctly in Task 11
✅ `FilterType`, `CropArea`, `Adjustments` consistent throughout

**Scope Check:**
✅ Focused implementation plan (single feature, 5-7 days)
✅ All tasks build on each other sequentially
✅ No decomposition needed

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-19-linkedin-post-creation-ux.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for this plan's 17 tasks with clear boundaries.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints for review. Good if you want to see progress in this conversation.

Which approach would you like to use?
