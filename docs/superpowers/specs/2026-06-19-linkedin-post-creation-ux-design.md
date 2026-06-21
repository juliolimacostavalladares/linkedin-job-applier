# LinkedIn Post Creation UX Redesign - Design Document

**Date:** 2026-06-19  
**Author:** Claude (AI Assistant)  
**Status:** Draft for Review  
**Project:** LinkedIn Job Explorer - Publisher Frontend

---

## Executive Summary

This document outlines the complete redesign of the post creation experience in the LinkedIn Publisher Frontend to match LinkedIn's native UX patterns while maintaining our existing design system. The redesign implements a modal-over-modal architecture with a comprehensive image editor featuring filters, cropping, adjustments, and accessibility features.

## Context and Goals

### Current State
The existing `CreatePostView` (661 lines) uses a traditional form layout with basic image upload functionality. While functional, it lacks the polished UX of LinkedIn's native post creation flow.

### Design Goals
1. **Replicate LinkedIn's UX flow** - Modal-based creation with dedicated image editor
2. **Maintain visual consistency** - Keep existing design system (colors, tokens, components)
3. **Complete image editing suite** - Filters, cropping, adjustments, alt text
4. **Client-side processing** - Use Canvas API for instant previews
5. **Modular architecture** - Reusable, testable components

### Out of Scope (Phase 2)
- **Tagging/Mentions** - LinkedIn-style people/company tagging
- **Video editing** - Focus on images only for now
- **AI-powered features** - Beyond existing AI text generation

---

## Key Design Decisions

### 1. Scope: Complete Implementation
Full-featured editor including filters (7 types), cropping (5 aspect ratios), adjustments (brightness/contrast/saturation), and alt text. Provides feature parity with LinkedIn's image editing capabilities.

### 2. Processing: Client-Side (Canvas API)
All image processing happens in the browser using native Canvas API. This provides instant preview, reduces server load, and works offline. Backend receives final edited images as blobs.

### 3. Architecture: Modal-over-Modal
Following LinkedIn's pattern exactly - main post creation modal remains open while image editor modal opens on top. Maintains familiar UX for users coming from LinkedIn.

### 4. Components: Modular and Reusable
Build specialized components that can be used independently. `ImageEditorModal` can be reused in other contexts (profile pictures, cover images, etc).

### 5. Design System: Maintain Current
Reuse existing UI components (Button, Card, Input, Toast) and design tokens. Only the interaction flow changes, not the visual style.

---

## Architecture Overview

### High-Level Structure

The system consists of two modal layers with distinct responsibilities:

**Layer 1 - PostCreationModal:**
- Primary modal for post creation
- Contains textarea for post text
- Action buttons (emoji, add media, etc)
- Preview thumbnails of selected images
- Scheduling and publishing controls

**Layer 2 - ImageEditorModal:**
- Secondary modal (higher z-index)
- Opens on top of PostCreationModal
- Fullscreen or near-fullscreen layout
- Complete image editing suite
- Independent backdrop and focus management

**Data Flow:**
1. User opens PostCreationModal → enters text → clicks "Add Media"
2. ImageEditorModal opens → user selects images → edits with Canvas
3. User clicks "Done" → Canvas generates final blobs → ImageEditorModal closes
4. PostCreationModal receives edited images → user publishes
5. FormData with text + edited images sent to backend

**Technology Stack:**
- React 19 + TypeScript
- Tailwind CSS (existing config)
- Canvas API (native, no external libraries)
- zustand (global state)
- lucide-react (icons)

---

## Section 1: Component Structure

### Component Hierarchy

```
PostCreationModal (Layer 1 - z-index: 50)
├── Modal Container
│   ├── Header (Profile avatar, "Publicar em Todos")
│   ├── Textarea (Post text)
│   ├── ImagePreviewGrid (Thumbnails of edited images)
│   ├── Action Bar (Emoji, Add Media, Link, etc)
│   └── Footer (Schedule toggle, Publish button)

ImageEditorModal (Layer 2 - z-index: 60)
├── Modal Container (fullscreen)
│   ├── Header ("Editor", close button)
│   ├── ImageCarousel (Navigation: "1 de X")
│   ├── Canvas Preview (Center, shows current image with edits)
│   ├── Editor Tabs
│   │   ├── CropTool (5 aspect ratios)
│   │   ├── FilterSelector (7 filters)
│   │   └── AdjustmentPanel (3 sliders)
│   ├── AltTextEditor (Accessibility textarea)
│   └── Footer (Back, Next/Done buttons)
```

### Core Components

#### PostCreationModal
**Responsibility:** Main post creation interface  
**State:** `text`, `editedImages`, `isScheduled`, `scheduledAt`  
**Reuses:** Button, Card, Input, Textarea from existing UI library  
**Key Features:**
- Opens from navbar/sidebar "Create Post" button
- Maintains existing design tokens (bg-card, brand-blue, etc)
- Shows thumbnails of edited images with remove option
- Scheduling toggle and datetime picker
- Calls `createPost(postData, images)` on publish

#### ImageEditorModal
**Responsibility:** Complete image editing workflow  
**State:** `images`, `currentIndex`, `edits`, `canvasRef`  
**Key Features:**
- File input for 1-9 images (JPEG, PNG, GIF)
- Carousel navigation between images
- Tab-based editor (Recortar | Filtrar | Ajustar)
- Real-time Canvas preview
- Alt text per image
- Generates final blobs on completion

#### ImageCarousel
**Responsibility:** Navigate between multiple images  
**Props:** `images`, `currentIndex`, `onNavigate`  
**UI:** "1 de X" counter, previous/next arrow buttons  
**Features:**
- Keyboard navigation (arrow keys)
- Thumbnail strip (optional)
- Disabled state for first/last image

#### FilterSelector
**Responsibility:** Apply visual filters to image  
**Props:** `selectedFilter`, `onSelectFilter`, `canvasRef`  
**UI:** Horizontal grid of 7 filter options with names and previews  
**Filters:**
- Original (none)
- Studio (contrast + brightness + saturation boost)
- Spotlight (high contrast + bright)
- Prime (sepia tone + contrast)
- Classic (partial grayscale)
- Edge (high contrast + desaturated)
- Luminate (bright + soft contrast)

#### CropTool
**Responsibility:** Crop images to specific aspect ratios  
**Props:** `imageData`, `cropArea`, `onCropChange`  
**UI:** Draggable crop area with handles, aspect ratio selector  
**Aspect Ratios:**
- Original (maintain source ratio)
- Quadrado (1:1)
- 4:1 (wide banner)
- 3:4 (portrait)
- 16:9 (landscape)

#### AdjustmentPanel
**Responsibility:** Fine-tune image properties  
**Props:** `adjustments`, `onAdjust`, `canvasRef`  
**UI:** Three labeled sliders  
**Adjustments:**
- Brilho (Brightness): -100 to +100
- Contraste (Contrast): -100 to +100
- Saturação (Saturation): -100 to +100

#### AltTextEditor
**Responsibility:** Add accessibility descriptions  
**Props:** `altText`, `onAltTextChange`  
**UI:** Textarea with character counter (max 1000 chars)  
**Features:**
- Auto-focus on tab switch
- Save per image (stored in EditedImage object)
- Validation and helpful placeholder

#### ImagePreviewGrid
**Responsibility:** Show thumbnails in PostCreationModal  
**Props:** `images: EditedImage[]`, `onRemove`  
**UI:** Grid layout (max 4 columns), hover shows remove button  
**Features:**
- Click thumbnail to preview
- X button to remove image
- Drag to reorder (optional enhancement)

---

## Section 2: State Management

### Global State (zustand store)

The existing zustand store remains largely unchanged:

```typescript
interface PublisherState {
  posts: LinkedInPost[];
  profile: Profile | null;
  createPost: (
    post: Omit<LinkedInPost, 'id' | 'createdAt' | 'updatedAt'>, 
    images?: File[]
  ) => Promise<void>;
  // ... other actions
}
```

**Key Change:** `createPost` now accepts optional `images?: File[]` parameter. When present, constructs FormData instead of JSON.

### Local State - PostCreationModal

```typescript
const [text, setText] = useState<string>('');
const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
const [isScheduled, setIsScheduled] = useState<boolean>(false);
const [scheduledAt, setScheduledAt] = useState<string>('');
const [showImageEditor, setShowImageEditor] = useState<boolean>(false);
```

**EditedImage Type:**
```typescript
interface EditedImage {
  blob: Blob;           // Final processed image
  originalName: string; // Original filename
  altText: string;      // Accessibility description
  thumbnail: string;    // Data URL for preview
}
```

### Local State - ImageEditorModal

```typescript
const [images, setImages] = useState<File[]>([]);
const [currentIndex, setCurrentIndex] = useState<number>(0);
const [edits, setEdits] = useState<ImageEdits>({
  filter: 'original',
  crop: null,
  adjustments: { brightness: 0, contrast: 0, saturation: 0 },
  altText: ''
});
const canvasRef = useRef<HTMLCanvasElement>(null);
```

**ImageEdits Type:**
```typescript
interface ImageEdits {
  filter: FilterType;
  crop: CropArea | null;
  adjustments: Adjustments;
  altText: string;
}

type FilterType = 'original' | 'studio' | 'spotlight' | 'prime' | 'classic' | 'edge' | 'luminate';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
}

interface Adjustments {
  brightness: number;  // -100 to +100
  contrast: number;    // -100 to +100
  saturation: number;  // -100 to +100
}
```

### State Flow

1. **Image Selection:** User selects files → stored in `ImageEditorModal.images`
2. **Editing:** User applies edits → stored in `ImageEditorModal.edits[currentIndex]`
3. **Navigation:** User switches images → `currentIndex` changes, edits persisted per image
4. **Finalization:** User clicks "Done" → Canvas processes all images → generates blobs
5. **Return:** Blobs passed to `PostCreationModal.editedImages`
6. **Publish:** FormData constructed with text + image blobs → sent to backend

---

## Section 3: Modal System Implementation

### Z-Index Strategy

```typescript
const MODAL_Z_INDEX = {
  postCreation: {
    backdrop: 40,
    modal: 50
  },
  imageEditor: {
    backdrop: 55,
    modal: 60
  }
} as const;
```

**Key Points:**
- PostCreationModal renders first (z-index: 50)
- When ImageEditorModal opens, PostCreationModal stays mounted but inactive
- ImageEditorModal has higher z-index (60) and darker backdrop
- Each modal manages its own backdrop independently

### Focus Management

```typescript
function useModalFocusTrap(isOpen: boolean, modalRef: React.RefObject<HTMLElement>) {
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

### Scroll Lock

```typescript
function useScrollLock(isLocked: boolean) {
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

### Escape Key Behavior

```typescript
function useModalEscapeKey(isOpen: boolean, onClose: () => void) {
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

**Behavior:** Escape key closes only the topmost modal. If ImageEditorModal is open, Escape closes it and returns focus to PostCreationModal.


---

## Section 4: Image Editor - Canvas API Implementation

### Canvas Processing Pipeline

All image editing happens client-side using the native Canvas API. The pipeline processes each image through these stages:

**Stage 1: Load Image**
```typescript
function loadImageToCanvas(file: File, canvas: HTMLCanvasElement): Promise<void> {
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
    
    img.onerror = reject;
    img.src = url;
  });
}
```

**Stage 2: Apply Crop** (if crop area defined)
```typescript
function applyCrop(canvas: HTMLCanvasElement, crop: CropArea): void {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.putImageData(imageData, 0, 0);
}
```

**Stage 3: Apply Filter**
```typescript
const FILTER_PRESETS: Record<FilterType, string> = {
  original: 'none',
  studio: 'contrast(1.1) brightness(1.05) saturate(1.1)',
  spotlight: 'contrast(1.2) brightness(1.1)',
  prime: 'sepia(0.3) contrast(1.15)',
  classic: 'grayscale(0.4) contrast(1.1)',
  edge: 'contrast(1.3) saturate(0.8)',
  luminate: 'brightness(1.2) contrast(0.9)'
};

function applyFilter(canvas: HTMLCanvasElement, filter: FilterType): void {
  const ctx = canvas.getContext('2d')!;
  ctx.filter = FILTER_PRESETS[filter];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  ctx.filter = 'none'; // Reset
}
```

**Stage 4: Apply Adjustments**
```typescript
function applyAdjustments(canvas: HTMLCanvasElement, adj: Adjustments): void {
  const ctx = canvas.getContext('2d')!;
  
  // Map -100/+100 range to CSS filter values
  const brightness = 1 + (adj.brightness / 100); // 0 to 2
  const contrast = 1 + (adj.contrast / 100);     // 0 to 2
  const saturation = 1 + (adj.saturation / 100); // 0 to 2
  
  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  ctx.filter = 'none'; // Reset
}
```

**Stage 5: Generate Final Blob**
```typescript
function generateBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate blob'));
      },
      'image/jpeg',
      0.9 // 90% quality
    );
  });
}
```

### Performance Optimizations

1. **Lazy Rendering:** Only process the current visible image, not all images at once
2. **Debounced Sliders:** 100ms debounce on adjustment sliders to avoid excessive re-renders
3. **Canvas Pooling:** Reuse canvas elements instead of creating new ones
4. **Memory Management:** Call `URL.revokeObjectURL()` after loading images
5. **Progressive Enhancement:** Show low-res preview while processing

---

## Section 5: Complete User Flow

### End-to-End Journey

**Step 1: Open Post Creation**
- User clicks "Criar Post" button in navbar/sidebar
- PostCreationModal opens with focus on textarea
- Familiar LinkedIn-style layout with design system colors

**Step 2: Add Media**
- User clicks "Adicionar mídia" button (image icon)
- Hidden file input triggers (accept: .jpg, .jpeg, .png, .gif)
- User selects 1-9 images from file system
- ImageEditorModal opens on top of PostCreationModal

**Step 3: Image Editor Experience**
- First image loads into canvas with "1 de X" indicator
- Three tabs visible: Recortar | Filtrar | Ajustar
- User applies edits, sees real-time preview on canvas
- Alt text textarea below canvas for accessibility

**Step 4: Multi-Image Editing**
- User clicks next arrow → navigates to image 2
- Previous edits auto-saved, new canvas loads
- Repeat editing process for each image
- Navigation: previous/next arrows + keyboard (arrow keys)

**Step 5: Finalize Edits**
- User clicks "Avançar" button (or "Concluir" on last image)
- Canvas processes all images sequentially
- Generates JPEG blobs at 90% quality
- ImageEditorModal closes gracefully

**Step 6: Review and Publish**
- PostCreationModal returns to focus
- ImagePreviewGrid shows thumbnails of edited images
- User reviews text + images
- Clicks "Publicar" (immediate) or toggle "Agendar" (scheduled)

**Step 7: Backend Submission**
- Frontend constructs FormData:
  - `text`: string
  - `images`: File[] (edited blobs)
  - `status`: 'published' | 'scheduled'
  - `scheduledAt`: ISO string (if scheduled)
- zustand `createPost(postData, images)` called
- apiService sends multipart/form-data to backend
- Backend handles upload and LinkedIn publishing

---

## Section 6: Error Handling

### Validation and User Errors

**Image Upload Validation:**
- Maximum 9 images (show toast: "Máximo de 9 imagens!")
- File size limit: 10MB per image (show toast: "Imagem muito grande (máx 10MB)")
- Supported formats: JPEG, PNG, GIF (reject others with toast)

**Canvas Processing Errors:**
- Corrupted image files → catch and show toast: "Falha ao processar imagem"
- Canvas API errors → fallback to original image, notify user
- Out of memory → reduce quality or dimensions, retry

**Network Errors:**
- Upload fails → show toast with retry option
- Timeout → allow user to cancel or retry
- Connection lost → save state to localStorage for recovery

### Graceful Degradation

**Modal Failures:**
- If ImageEditorModal fails to open → close gracefully, return to PostCreationModal
- State preservation → text entered is never lost
- Error boundary → catch React errors, show friendly message

**Recovery Mechanisms:**
- **Auto-save:** Save post text to localStorage every 5 seconds
- **Session Recovery:** On page reload, check localStorage for unsaved drafts
- **Image Backup:** Keep original files in memory until publish succeeds

---

## Implementation Notes

### File Structure

```
src/
├── components/
│   ├── CreatePostView.tsx (refactored orchestrator)
│   ├── PostCreationModal.tsx (new)
│   ├── ImageEditorModal.tsx (new)
│   ├── image-editor/
│   │   ├── ImageCarousel.tsx
│   │   ├── FilterSelector.tsx
│   │   ├── CropTool.tsx
│   │   ├── AdjustmentPanel.tsx
│   │   └── AltTextEditor.tsx
│   ├── ImagePreviewGrid.tsx (new)
│   └── ui/ (existing: Button, Card, Input, Toast)
├── hooks/
│   ├── useModalStack.ts (new)
│   ├── useModalFocusTrap.ts (new)
│   ├── useScrollLock.ts (new)
│   ├── useModalEscapeKey.ts (new)
│   └── useCanvasEditor.ts (new)
├── utils/
│   ├── canvasProcessing.ts (new)
│   └── imageValidation.ts (new)
└── types/
    └── imageEditor.ts (new interfaces)
```

### Development Phases

**Phase 1: Modal Infrastructure** (Day 1-2)
- Implement modal layering system
- Create Modal base component with z-index management
- Build focus trap and scroll lock hooks
- Test modal-over-modal behavior

**Phase 2: Image Editor Core** (Day 2-3)
- Build ImageEditorModal shell
- Implement Canvas API wrapper
- Create ImageCarousel with navigation
- Test basic image loading and display

**Phase 3: Editing Features** (Day 3-5)
- Implement FilterSelector with 7 presets
- Build CropTool with aspect ratios
- Create AdjustmentPanel with sliders
- Add AltTextEditor
- Test all editing features individually

**Phase 4: Integration** (Day 5-6)
- Connect ImageEditorModal to PostCreationModal
- Implement blob generation and passing
- Update apiService for FormData submission
- Test end-to-end flow

**Phase 5: Polish & Testing** (Day 6-7)
- Error handling and validation
- Performance optimizations
- Accessibility testing (keyboard navigation, screen readers)
- Cross-browser testing
- Mobile responsive tweaks

### Testing Strategy

**Unit Tests:**
- Canvas processing functions (crop, filter, adjustments)
- Image validation utilities
- Hook behavior (focus trap, scroll lock)

**Integration Tests:**
- Modal opening/closing sequences
- Image editing workflow
- FormData construction
- State persistence

**E2E Tests:**
- Complete post creation flow
- Multi-image editing
- Scheduled post creation
- Error recovery scenarios

---

## Next Steps

1. **Review & Approval:** Stakeholder review of this design document
2. **Plan Creation:** Break down into detailed implementation tasks
3. **Environment Setup:** Ensure Canvas API support across target browsers
4. **Component Scaffolding:** Create file structure and component shells
5. **Iterative Development:** Follow phased approach outlined above
6. **Continuous Testing:** Test each component as it's built
7. **Integration:** Combine components and test end-to-end
8. **Polish:** Performance, accessibility, and UX refinements

---

## Conclusion

This design provides a comprehensive roadmap for implementing LinkedIn-style post creation UX while maintaining our existing design system. The modular architecture ensures components are reusable, testable, and maintainable. Client-side image processing with Canvas API provides instant feedback and reduces server load. The modal-over-modal pattern matches user expectations from LinkedIn's native experience.

**Key Success Metrics:**
- **UX Parity:** Match LinkedIn's editing features and flow
- **Performance:** Image processing <500ms per image
- **Accessibility:** Full keyboard navigation and screen reader support
- **Code Quality:** <300 lines per component, >80% test coverage
- **Maintainability:** Clear separation of concerns, reusable components

**Estimated Timeline:** 5-7 development days for complete implementation.

---

**Document Status:** Ready for Review  
**Next Action:** User review and approval before proceeding to implementation planning
