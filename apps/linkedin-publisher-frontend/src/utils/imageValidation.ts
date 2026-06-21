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
