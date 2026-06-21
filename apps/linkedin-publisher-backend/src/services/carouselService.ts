import { logger } from '../utils/logger';
import hljs from 'highlight.js';
import path from 'path';
import fs from 'fs';

export interface SlideData {
  type: 'cover' | 'content' | 'cta' | 'code' | 'text';
  title: string;
  subtitle?: string;
  content?: string; // Markdown or simple list lines separated by \n
  footer?: string;
  authorName?: string;
  code?: string;
  language?: string;
}

export interface CarouselConfig {
  theme: 'dark-premium' | 'gradient-purple' | 'startup-clean' | 'bold-yellow' | 'warm-creative';
  title: string;
  authorName: string;
  slides: SlideData[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdown(text: string): string {
  if (text.includes('|') && text.split('\n').some(line => line.trim().startsWith('|'))) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const rows = lines.map(line => {
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      return cells;
    }).filter(row => row.length > 0);
    
    if (rows.length > 1) {
      const hasSeparator = rows[1].every(cell => /^[-:|]+$/.test(cell));
      const headers = rows[0];
      const dataRows = hasSeparator ? rows.slice(2) : rows.slice(1);
      
      let tableHtml = '<table class="slide-table">';
      tableHtml += '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>';
      tableHtml += '<tbody>' + dataRows.map(row => '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>').join('') + '</tbody>';
      tableHtml += '</table>';
      return tableHtml;
    }
  }
  return text.split('\n').map(p => `<p class="slide-paragraph">${p}</p>`).join('');
}

export class CarouselService {
  /**
   * Builds the HTML content representing the slides of the carousel.
   */
  buildHtml(config: CarouselConfig): string {
    const { theme, authorName, slides } = config;

    const renderedSlidesHtml = slides.map((slide, index) => {
      const isCover = slide.type === 'cover';
      const isCta = slide.type === 'cta';
      const slideNum = index + 1;
      const totalSlides = slides.length;

      // Extract author abbreviation for the avatar
      const authorAbbrev = (slide.authorName || authorName || 'JL')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      let bodyContent = '';

      if (isCover) {
        bodyContent = `
          <div class="cover-layout">
            <h1>${slide.title}</h1>
            <div class="subtitle">${slide.subtitle || ''}</div>
            <div class="author-badge">
              <div class="author-avatar">${authorAbbrev}</div>
              <div class="author-name">${slide.authorName || authorName}</div>
            </div>
          </div>
        `;
      } else if (isCta) {
        bodyContent = `
          <div class="cover-layout" style="align-items: center; text-align: center; justify-content: center; width: 100%;">
            <h1 style="font-size: 64px;">${slide.title}</h1>
            <div class="subtitle" style="margin-bottom: 40px;">${slide.subtitle || ''}</div>
            <div class="author-badge" style="justify-content: center; width: 100%;">
              <div class="author-avatar">${authorAbbrev}</div>
              <div class="author-name">${slide.authorName || authorName}</div>
            </div>
          </div>
        `;
      } else if (slide.type === 'code') {
        const lang = slide.language || 'javascript';
        let highlightedCode = '';
        try {
          if (hljs.getLanguage(lang)) {
            highlightedCode = hljs.highlight(slide.code || '', { language: lang }).value;
          } else {
            highlightedCode = hljs.highlightAuto(slide.code || '').value;
          }
        } catch (error) {
          highlightedCode = escapeHtml(slide.code || '');
        }

        bodyContent = `
          <h2>${slide.title}</h2>
          <div class="slide-body">
            <div class="code-editor-window">
              <div class="code-editor-header">
                <div class="code-editor-dots">
                  <span class="dot dot-red"></span>
                  <span class="dot dot-yellow"></span>
                  <span class="dot dot-green"></span>
                </div>
                <span class="code-editor-lang">${lang}</span>
              </div>
              <pre class="code-editor-body"><code class="hljs ${lang}">${highlightedCode}</code></pre>
            </div>
          </div>
        `;
      } else if (slide.type === 'text') {
        bodyContent = `
          <h2>${slide.title}</h2>
          <div class="slide-body">
            <div class="text-content-wrapper">
              ${parseMarkdown(slide.content || '')}
            </div>
          </div>
        `;
      } else {
        // Content slide: Split lines by \n to render as bullet points
        const lines = (slide.content || '')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        const listItemsHtml = lines
          .map((line) => {
            // Remove leading bullet symbols if generated by AI
            const cleaned = line.replace(/^[-*•■]\s*/, '');
            return `<li>${cleaned}</li>`;
          })
          .join('');

        bodyContent = `
          <h2>${slide.title}</h2>
          <div class="slide-body">
            <ul class="points-list">
              ${listItemsHtml}
            </ul>
          </div>
        `;
      }

      // Bottom footer of each slide
      const footerHtml = `
        <div class="slide-footer">
          <div class="footer-author">${slide.authorName || authorName}</div>
          ${
            slideNum < totalSlides
              ? `<div class="swipe-indicator">
                  <span>${slide.footer || 'Deslize'}</span>
                  <span>➔</span>
                 </div>`
              : `<div class="swipe-indicator" style="color: #10b981;">
                  <span>Pronto</span>
                 </div>`
          }
          <div class="page-number">${slideNum} / ${totalSlides}</div>
        </div>
      `;

      return `
        <div class="slide theme-${theme}">
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            ${bodyContent}
            ${footerHtml}
          </div>
        </div>
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.title || 'LinkedIn Carousel'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&family=Outfit:wght@600;700;800;900&family=Fira+Code:wght@500;700&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f1f5f9;
      font-family: 'Inter', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .slide {
      width: 1080px;
      height: 1350px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 90px;
      page-break-after: always;
      box-sizing: border-box;
    }

    /* Code Editor Window */
    .code-editor-window {
      background-color: #1e1e2e;
      border: 1px solid #313244;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      margin-top: 20px;
      font-family: 'Fira Code', 'Courier New', Courier, monospace;
      text-align: left;
    }
    
    /* Highlight.js GitHub Dark Theme Styles */
    .hljs { color: #c9d1d9; background: #0d1117 }
    .hljs-doctag, .hljs-keyword, .hljs-meta .hljs-keyword, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-variable.language_ { color: #ff7b72 }
    .hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_ { color: #d2a8ff }
    .hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id, .hljs-variable { color: #79c0ff }
    .hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #a5d6ff }
    .hljs-built_in, .hljs-symbol { color: #ffa657 }
    .hljs-code, .hljs-comment, .hljs-formula { color: #8b949e }
    .hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag { color: #7ee787 }
    .hljs-subst { color: #c9d1d9 }
    .hljs-section { color: #1f6feb; font-weight: 700 }
    .hljs-bullet { color: #f2cc60 }
    .hljs-emphasis { color: #c9d1d9; font-style: italic }
    .hljs-strong { color: #c9d1d9; font-weight: 700 }
    .hljs-addition { color: #aff5b4; background-color: #033a16 }
    .hljs-deletion { color: #ffdcd7; background-color: #67060c }
    .code-editor-header {
      background-color: #181825;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #313244;
    }
    .code-editor-dots {
      display: flex;
      gap: 8px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-red { background-color: #f38ba8; }
    .dot-yellow { background-color: #f9e2af; }
    .dot-green { background-color: #a6e3a1; }
    .code-editor-lang {
      color: #cdd6f4;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .code-editor-body {
      padding: 24px;
      margin: 0;
      font-size: 24px;
      line-height: 1.5;
      color: #cdd6f4;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* Slide Table and Text Paragraphs */
    .slide-paragraph {
      font-size: 30px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .slide-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 24px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    .theme-startup-clean .slide-table {
      background: rgba(0, 0, 0, 0.02);
      color: #0f172a;
    }
    .slide-table th, .slide-table td {
      padding: 16px 20px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .theme-startup-clean .slide-table th, 
    .theme-startup-clean .slide-table td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .slide-table th {
      font-weight: 700;
      background: rgba(255, 255, 255, 0.1);
    }
    .theme-startup-clean .slide-table th {
      background: rgba(0, 0, 0, 0.04);
    }

    /* ─── Themes styles ─── */
    
    /* 1. Dark Premium */
    .theme-dark-premium {
      background: radial-gradient(circle at 10% 20%, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
    }
    .theme-dark-premium h2 {
      font-weight: 800;
      font-size: 54px;
      line-height: 1.25;
      color: #ffffff;
    }
    .theme-dark-premium h1 {
      color: #ffffff;
    }
    .theme-dark-premium p, .theme-dark-premium li {
      font-size: 30px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .theme-dark-premium .author-avatar {
      background-color: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    .theme-dark-premium ul.points-list li::before {
      content: "➔";
      color: #38bdf8;
    }

    /* 2. Gradient Purple */
    .theme-gradient-purple {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
      color: #ffffff;
    }
    .theme-gradient-purple h2 {
      font-weight: 900;
      font-size: 54px;
      line-height: 1.2;
      color: #ffffff;
    }
    .theme-gradient-purple h1 {
      color: #ffffff;
    }
    .theme-gradient-purple p, .theme-gradient-purple li {
      font-size: 30px;
      line-height: 1.6;
      color: #e0e7ff;
    }
    .theme-gradient-purple .author-avatar {
      background-color: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
    .theme-gradient-purple ul.points-list li::before {
      content: "★";
      color: #f472b6;
    }

    /* 3. Startup Clean */
    .theme-startup-clean {
      background-color: #ffffff;
      color: #0f172a;
      border: 1px solid #f1f5f9;
    }
    .theme-startup-clean h2 {
      font-weight: 800;
      font-size: 52px;
      line-height: 1.25;
      color: #0f172a;
    }
    .theme-startup-clean h1 {
      color: #0f172a;
    }
    .theme-startup-clean p, .theme-startup-clean li {
      font-size: 30px;
      line-height: 1.6;
      color: #334155;
    }
    .theme-startup-clean .author-avatar {
      background-color: #0f172a;
      color: #ffffff;
    }
    .theme-startup-clean ul.points-list li::before {
      content: "✔";
      color: #0284c7;
    }

    /* 4. Bold Yellow */
    .theme-bold-yellow {
      background-color: #facc15;
      color: #000000;
    }
    .theme-bold-yellow h2 {
      font-weight: 900;
      font-size: 54px;
      line-height: 1.2;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }
    .theme-bold-yellow h1 {
      color: #000000;
      text-transform: uppercase;
      font-weight: 900;
    }
    .theme-bold-yellow p, .theme-bold-yellow li {
      font-size: 29px;
      line-height: 1.5;
      color: #000000;
      font-weight: 500;
    }
    .theme-bold-yellow .author-avatar {
      background-color: #000000;
      color: #facc15;
    }
    .theme-bold-yellow ul.points-list li::before {
      content: "■";
      color: #000000;
    }

    /* 5. Warm Creative */
    .theme-warm-creative {
      background-color: #fcf8f2;
      color: #292524;
    }
    .theme-warm-creative h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: 54px;
      line-height: 1.25;
      color: #441507;
    }
    .theme-warm-creative h1 {
      font-family: 'Playfair Display', Georgia, serif;
      color: #441507;
    }
    .theme-warm-creative p, .theme-warm-creative li {
      font-size: 30px;
      line-height: 1.6;
      color: #78350f;
    }
    .theme-warm-creative .author-avatar {
      background-color: #ea580c;
      color: #fcf8f2;
    }
    .theme-warm-creative ul.points-list li::before {
      content: "•";
      color: #ea580c;
      font-size: 40px;
      line-height: 0.8;
    }

    /* Layout patterns */
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: 30px;
      margin-bottom: 30px;
    }

    .cover-layout {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      height: 100%;
      flex: 1;
    }

    .cover-layout h1 {
      font-size: 72px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }

    .cover-layout .subtitle {
      font-size: 34px;
      opacity: 0.9;
      margin-bottom: 60px;
      line-height: 1.4;
      font-weight: 500;
    }

    .author-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
    }

    .author-avatar {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
    }

    .author-name {
      font-size: 26px;
      font-weight: 600;
    }

    /* Points styles */
    ul.points-list {
      list-style-type: none;
    }

    ul.points-list li {
      margin-bottom: 30px;
      display: flex;
      align-items: flex-start;
      gap: 20px;
      font-size: 30px;
    }

    ul.points-list li::before {
      font-size: 32px;
      font-weight: bold;
      flex-shrink: 0;
    }

    /* Footer layout */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 30px;
    }

    .theme-startup-clean .slide-footer {
      border-top: 1px solid rgba(15, 23, 42, 0.1);
    }

    .theme-bold-yellow .slide-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.15);
    }

    .theme-warm-creative .slide-footer {
      border-top: 1px solid rgba(120, 53, 15, 0.15);
    }

    .footer-author {
      font-size: 22px;
      font-weight: 500;
      opacity: 0.85;
    }

    .swipe-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.9;
    }

    .page-number {
      font-size: 22px;
      font-weight: 700;
      opacity: 0.8;
    }

    @page {
      size: 1080px 1350px;
      margin: 0;
    }

    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: transparent !important;
        width: 1080px !important;
        height: 1350px !important;
        overflow: visible !important;
      }
      .slide {
        width: 1080px !important;
        height: 1350px !important;
        page-break-before: always !important;
        page-break-inside: avoid !important;
        page-break-after: always !important;
        margin: 0 !important;
        border: none !important;
        box-sizing: border-box !important;
      }
      .slide:first-child {
        page-break-before: avoid !important;
      }
    }
  </style>
</head>
<body>
  ${renderedSlidesHtml}
</body>
</html>`;
  }

  /**
   * Generates a PDF buffer from a carousel config using Puppeteer.
   */
  async generatePdfBuffer(config: CarouselConfig): Promise<Buffer> {
    const html = this.buildHtml(config);
    
    logger.info('Generating PDF carousel from HTML', { 
      slideCount: config.slides.length,
      theme: config.theme 
    });

    const { default: puppeteer } = await import('puppeteer');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    try {
      const page = await browser.newPage();

      // Set exact viewport size to match target print resolution
      await page.setViewport({
        width: 1080,
        height: 1350,
        deviceScaleFactor: 1,
      });

      // Render the HTML slides
      await page.setContent(html, {
        waitUntil: 'load',
        timeout: 30000,
      });

      // Export as PDF with LinkedIn optimized size (1080px x 1350px)
      const pdf = await page.pdf({
        width: '1080px',
        height: '1350px',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      return Buffer.from(pdf);
    } catch (error) {
      logger.error('Error generating carousel PDF:', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    } finally {
      await browser.close();
    }
  }
}

export const carouselService = new CarouselService();
