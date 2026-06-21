import { describe, it, expect } from 'vitest';
import { convertMarkdownToUnicode } from '../markdownFormatter';

describe('markdownFormatter', () => {
  it('should convert bold text (**text**)', () => {
    const text = 'This is **bold** text';
    const result = convertMarkdownToUnicode(text);
    // 𝗯𝗼𝗹𝗱 in Unicode characters
    expect(result).toContain('𝗯𝗼𝗹𝗱');
  });

  it('should convert italic text (*text*)', () => {
    const text = 'This is *italic* text';
    const result = convertMarkdownToUnicode(text);
    // 𝘪𝘵𝘢𝘭𝘪𝘤 in Unicode characters
    expect(result).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
  });

  it('should convert bold-italic text (***text***)', () => {
    const text = 'This is ***bold italic*** text';
    const result = convertMarkdownToUnicode(text);
    // 𝙗𝙤𝙡𝙙 𝙞𝙩𝙖𝙡𝙞𝙘 in Unicode characters
    expect(result).toContain('𝙗𝙤𝙡𝙙 𝙞𝙩𝙖𝙡𝙞𝙘');
  });

  it('should convert strikethrough text (~~text~~)', () => {
    const text = 'This is ~~strikethrough~~ text';
    const result = convertMarkdownToUnicode(text);
    expect(result).toContain('s̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶');
  });

  it('should handle mixed styling in a paragraph', () => {
    const text = 'Hello **world**, this is *italic* and ~~deleted~~.';
    const result = convertMarkdownToUnicode(text);
    expect(result).toContain('𝘄𝗼𝗿𝗹𝗱');
    expect(result).toContain('𝘪𝘵𝘢𝘭𝘪𝘤');
    expect(result).toContain('d̶e̶l̶e̶t̶e̶d̶');
  });

  it('should handle nested and complex mixed styling', () => {
    const text = 'This is **bold *italic* bold**';
    const result = convertMarkdownToUnicode(text);
    expect(result).toContain('𝗯𝗼𝗹𝗱 𝗶𝘁𝗮𝗹𝗶𝗰 𝗯𝗼𝗹𝗱');
  });
});
