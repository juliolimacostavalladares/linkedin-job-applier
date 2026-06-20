/**
 * Image Editor Type Definitions
 * Defines types and interfaces for the LinkedIn Post image editor system
 */

/**
 * Available filter types for image processing
 */
export type FilterType =
  | 'original'
  | 'studio'
  | 'spotlight'
  | 'prime'
  | 'classic'
  | 'edge'
  | 'luminate';

/**
 * Available aspect ratio options for image cropping
 */
export type AspectRatio =
  | 'original'
  | 'square'
  | '4:1'
  | '3:4'
  | '16:9';

/**
 * Represents a crop area within an image
 */
export interface CropArea {
  /** X coordinate of the crop area (pixels) */
  x: number;
  /** Y coordinate of the crop area (pixels) */
  y: number;
  /** Width of the crop area (pixels) */
  width: number;
  /** Height of the crop area (pixels) */
  height: number;
  /** Aspect ratio constraint for the crop */
  aspectRatio: AspectRatio;
}

/**
 * Image adjustment values
 * All values range from -100 to +100
 */
export interface Adjustments {
  /** Brightness adjustment (-100 to +100) */
  brightness: number;
  /** Contrast adjustment (-100 to +100) */
  contrast: number;
  /** Saturation adjustment (-100 to +100) */
  saturation: number;
}

/**
 * Complete set of edits applied to an image
 */
export interface ImageEdits {
  /** Applied filter type */
  filter: FilterType;
  /** Crop area (null if no crop applied) */
  crop: CropArea | null;
  /** Color and tone adjustments */
  adjustments: Adjustments;
  /** Alternative text for accessibility */
  altText: string;
}

/**
 * Represents a fully edited and processed image
 */
export interface EditedImage {
  /** The processed image as a Blob */
  blob: Blob;
  /** Original filename */
  originalName: string;
  /** Alternative text for accessibility */
  altText: string;
  /** Data URL for thumbnail preview */
  thumbnail: string;
}

/**
 * CSS filter string presets for each filter type
 * Maps filter names to their CSS filter property values
 */
export const FILTER_PRESETS: Record<FilterType, string> = {
  original: 'none',
  studio: 'contrast(1.1) brightness(1.05) saturate(1.1)',
  spotlight: 'contrast(1.2) brightness(1.1)',
  prime: 'sepia(0.3) contrast(1.15)',
  classic: 'grayscale(0.4) contrast(1.1)',
  edge: 'contrast(1.3) saturate(0.8)',
  luminate: 'brightness(1.2) contrast(0.9)'
};

/**
 * Numeric aspect ratio values for calculations
 * null indicates original/unconstrained aspect ratio
 */
export const ASPECT_RATIO_VALUES: Record<AspectRatio, number | null> = {
  original: null,
  square: 1,
  '4:1': 4,
  '3:4': 0.75,
  '16:9': 16 / 9
};
