/**
 * Helper to convert standard alphabetical characters and numbers
 * to their Mathematical Sans-Serif Bold Unicode equivalents.
 */
function toUnicodeBold(char: string): string {
  const code = char.charCodeAt(0);
  // Uppercase A-Z -> Bold Sans-Serif A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(code + 120211);
  }
  // Lowercase a-z -> Bold Sans-Serif a-z
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(code + 120205);
  }
  // Digits 0-9 -> Bold Sans-Serif 0-9
  if (code >= 48 && code <= 57) {
    return String.fromCodePoint(code + 120764);
  }
  return char;
}

/**
 * Helper to convert standard alphabetical characters
 * to their Mathematical Sans-Serif Italic Unicode equivalents.
 */
function toUnicodeItalic(char: string): string {
  const code = char.charCodeAt(0);
  // Uppercase A-Z -> Italic Sans-Serif A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(code + 120263);
  }
  // Lowercase a-z -> Italic Sans-Serif a-z
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(code + 120257);
  }
  return char;
}

/**
 * Helper to convert standard alphabetical characters
 * to their Mathematical Sans-Serif Bold Italic Unicode equivalents.
 */
function toUnicodeBoldItalic(char: string): string {
  const code = char.charCodeAt(0);
  // Uppercase A-Z -> Bold Italic Sans-Serif A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(code + 120315);
  }
  // Lowercase a-z -> Bold Italic Sans-Serif a-z
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(code + 120309);
  }
  return char;
}

/**
 * Helper to add combining unicode strikethrough (long stroke overlay) to each character.
 */
function toUnicodeStrikethrough(text: string): string {
  return text.split('').map((char) => char + '\u0336').join('');
}

/**
 * Converts basic markdown syntax directly into formatted Unicode text
 * compatible with LinkedIn's feed renderer.
 * 
 * Supports:
 * - ***bold-italic*** or ___bold-italic___
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - ~~strikethrough~~
 */
export function convertMarkdownToUnicode(text: string): string {
  let result = text;

  // 1. Bold-Italic (***text*** or ___text___)
  result = result.replace(/\*\*\*([\s\S]+?)\*\*\*/g, (_, p1: string) => {
    return p1.split('').map(toUnicodeBoldItalic).join('');
  });
  result = result.replace(/___([\s\S]+?)___/g, (_, p1: string) => {
    return p1.split('').map(toUnicodeBoldItalic).join('');
  });

  // 2. Bold (**text** or __text__)
  result = result.replace(/\*\*([\s\S]+?)\*\*/g, (_, p1: string) => {
    return p1.split('').map(toUnicodeBold).join('');
  });
  result = result.replace(/__([\s\S]+?)__/g, (_, p1: string) => {
    return p1.split('').map(toUnicodeBold).join('');
  });

  // 3. Italic (*text* or _text_)
  result = result.replace(/\*([\s\S]+?)\*/g, (_, p1: string) => {
    return p1.split('').map(toUnicodeItalic).join('');
  });
  result = result.replace(/_([\s\S]+?)_/g, (_, p1: string) => {
    return p1.split('').map(toUnicodeItalic).join('');
  });

  // 4. Strikethrough (~~text~~)
  result = result.replace(/~~([\s\S]+?)~~/g, (_, p1: string) => {
    return toUnicodeStrikethrough(p1);
  });

  return result;
}
