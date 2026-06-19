// src/utils/__tests__/imageValidation.test.ts
import { describe, it, expect } from 'vitest';
import { validateImageFile, validateImageFiles, ValidationResult } from '../imageValidation';

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
