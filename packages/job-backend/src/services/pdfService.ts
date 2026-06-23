import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// ─── HTML template that wraps the converted markdown ──────────────────────────
function buildHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      color: #1a1a1a;
      background: #ffffff;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      max-width: 794px;
      margin: 0 auto;
      padding: 42px 56px;
    }

    /* ── Header block ─────────────────────────────────────────────────────── */
    .header-name {
      font-family: 'EB Garamond', 'Times New Roman', serif;
      font-size: 30pt;
      font-weight: 700;
      color: #111111;
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .header-headline {
      font-size: 12pt;
      font-weight: 400;
      color: #374151;
      margin-bottom: 8px;
    }

    .header-contact {
      font-size: 10.5pt;
      color: #4b5563;
      margin-bottom: 3px;
      line-height: 1.5;
    }

    .header-contact a {
      color: #1d4ed8;
      text-decoration: none;
    }

    /* ── Divider ─────────────────────────────────────────────────────────── */
    hr {
      border: none;
      border-top: 0.75px solid #c8c8c8;
      margin: 14px 0;
    }

    /* ── Section headings (### / ## / #) ────────────────────────────────── */
    h1, h2, h3 {
      font-family: 'EB Garamond', 'Times New Roman', serif;
      font-size: 13pt;
      font-weight: 700;
      color: #111111;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    h1:first-child, h2:first-child, h3:first-child {
      margin-top: 6px;
    }

    /* ── Paragraphs ─────────────────────────────────────────────────────── */
    p {
      margin-bottom: 7px;
      line-height: 1.6;
    }

    /* ── Lists (bullets) ────────────────────────────────────────────────── */
    ul {
      padding-left: 18px;
      margin-bottom: 6px;
    }

    ul li {
      margin-bottom: 5px;
      line-height: 1.6;
    }

    ul li::marker {
      color: #374151;
    }

    /* ── Bold / italic inline ────────────────────────────────────────────── */
    strong { font-weight: 700; color: #111111; }
    em     { font-style: italic; color: #374151; }

    /* ── Sub-section: role title (bold-only line) ──────────────────────── */
    p > strong:first-child:last-child,
    p > strong:only-child {
      display: block;
      font-size: 11.5pt;
      font-weight: 700;
      color: #111111;
      margin-top: 10px;
      margin-bottom: 1px;
    }

    /* ── Date / location italic line ────────────────────────────────────── */
    p > em:first-child:last-child,
    p > em:only-child {
      display: block;
      font-size: 10.5pt;
      color: #4b5563;
      font-style: italic;
      margin-bottom: 4px;
    }

    /* ── Links ──────────────────────────────────────────────────────────── */
    a {
      color: #1d4ed8;
      text-decoration: none;
    }

    /* ── Print overrides ─────────────────────────────────────────────────── */
    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      html, body { background: white; }
      .page      { padding: 42px 56px; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

// ─── Pre-process markdown: handle <div style="..."> header blocks ─────────────
// The AI may emit HTML <div style="font-size:2.5em"> blocks for the header.
// We want to preserve those as-is (marked will pass HTML through).
// We also handle plain markdown headers gracefully.
function preprocessMarkdown(markdown: string): string {
  // Normalise line endings
  return markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export class PdfService {
  async generateFromMarkdown(markdown: string, outputPath: string): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = await this.generateFromMarkdownToBuffer(markdown);
    fs.writeFileSync(outputPath, buffer);
  }

  async generateFromMarkdownToBuffer(markdown: string): Promise<Buffer> {
    const processed  = preprocessMarkdown(markdown);
    const bodyHtml   = await marked.parse(processed, { async: false });
    const fullHtml   = buildHtml(bodyHtml);

    // Dynamic import so the module resolves at runtime (ESM-safe)
    const { default: puppeteer } = await import('puppeteer');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    });

    try {
      const page = await browser.newPage();

      await page.setContent(fullHtml, {
        waitUntil: 'load',
        timeout: 30_000,
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}

export const pdfService = new PdfService();
