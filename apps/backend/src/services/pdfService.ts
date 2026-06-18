import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface TextToken {
  text: string;
  bold: boolean;
  italic: boolean;
}

export class PdfService {
  async generateFromMarkdown(markdown: string, outputPath: string): Promise<void> {
    // Ensure the output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 45,
        size: 'A4',
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      try {
        this.render(doc, markdown);
        doc.end();
      } catch (err) {
        reject(err);
      }

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });
  }

  async generateFromMarkdownToBuffer(markdown: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 45,
        size: 'A4',
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      try {
        this.render(doc, markdown);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private render(doc: PDFKit.PDFDocument, markdown: string) {
    // Clean line endings and split
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    
    // Split into header and body
    const headerLines: string[] = [];
    const bodyLines: string[] = [];
    let inHeader = true;

    // Common section titles to fallback-detect headings without explicit markdown tags
    const commonSectionTitles = [
      'resumo profissional', 'resumo', 'sobre', 'professional summary', 'summary', 'about', 'about me', 'perfil',
      'experiência profissional', 'experiência', 'experiências', 'professional experience', 'experience', 'work experience', 'histórico profissional',
      'habilidades técnicas', 'habilidades', 'competências', 'technical skills', 'skills', 'skills & tools', 'tecnologias',
      'formação acadêmica', 'formação', 'educação', 'education', 'academic background',
      'certificações', 'certificados', 'certifications', 'courses & certifications', 'cursos',
      'idiomas', 'languages', 'projetos', 'projects'
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      const strippedLine = this.stripHtml(trimmed);
      const lowerTrimmed = strippedLine.toLowerCase().replace(/[:#*_-]/g, '').trim();

      // Check if we hit a section header or a horizontal line to end the header block
      if (
        trimmed.startsWith('## ') || 
        trimmed.startsWith('### ') || 
        trimmed.startsWith('- ') || 
        trimmed.startsWith('* ') ||
        trimmed === '---' ||
        commonSectionTitles.includes(lowerTrimmed)
      ) {
        inHeader = false;
      }

      // Stop header block if it exceeds a reasonable line limit to avoid running into the body
      if (headerLines.filter(l => l.trim().length > 0).length >= 6) {
        inHeader = false;
      }

      if (inHeader) {
        headerLines.push(line);
      } else {
        bodyLines.push(line);
      }
    }

    // Render header block (Name, Title, Contact Info)
    this.renderHeaderBlock(doc, headerLines);

    // Render body
    let lastWasSection = false;
    for (const line of bodyLines) {
      const trimmed = line.trim();
      
      // Handle horizontal rule divider lines
      if (trimmed === '---') {
        doc.moveDown(0.35);
        const y = doc.y;
        doc.moveTo(45, y)
           .lineTo(doc.page.width - 45, y)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
        doc.moveDown(0.45);
        lastWasSection = false;
        continue;
      }

      const cleaned = this.cleanText(this.stripHtml(trimmed));
      const lowerCleaned = cleaned.toLowerCase().replace(/[:#*_-]/g, '').trim();

      if (
        cleaned.startsWith('## ') || 
        cleaned.startsWith('### ') || 
        (!cleaned.startsWith('#') && commonSectionTitles.includes(lowerCleaned))
      ) {
        // Section Title (major heading) -> Serif Font (Times-Bold) in Uppercase
        const titleText = cleaned.replace(/^#+\s*/, '').replace(/:$/, '').trim().toUpperCase();
        
        // Add vertical spacing
        if (doc.y > 100) {
          doc.moveDown(0.7);
        } else {
          doc.moveDown(0.2);
        }

        // Avoid page break right after section title
        if (doc.y > doc.page.height - 120) {
          doc.addPage();
        }

        doc.font('Times-Bold').fontSize(11).fillColor('#000000').text(titleText);
        doc.moveDown(0.35);
        lastWasSection = true;
      } else if (cleaned.startsWith('**') && cleaned.endsWith('**')) {
        // Sub-section (Company / Job Role) -> Helvetica-Bold
        const subTitleText = cleaned.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
        
        // Avoid page break right after sub-section title
        if (doc.y > doc.page.height - 85) {
          doc.addPage();
        } else {
          doc.moveDown(0.35);
        }

        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000').text(subTitleText);
        doc.moveDown(0.15);
        lastWasSection = false;
      } else if (cleaned.startsWith('*') && cleaned.endsWith('*') && !cleaned.startsWith('* ')) {
        // Date / Location Line -> Times-Italic (Serif Italic)
        const dateText = cleaned.replace(/^\*/, '').replace(/\*$/, '').trim();

        if (doc.y > doc.page.height - 70) {
          doc.addPage();
        }

        doc.font('Times-Italic').fontSize(8.5).fillColor('#4b5563').text(dateText);
        doc.moveDown(0.15);
        lastWasSection = false;
      } else if (
        cleaned.startsWith('- ') || 
        cleaned.startsWith('* ') || 
        cleaned.startsWith('*   ') || 
        cleaned.startsWith('-   ')
      ) {
        // Bullet point
        const itemText = cleaned.replace(/^[\*\-]\s*/, '').trim();
        
        // Avoid orphan lines
        if (doc.y > doc.page.height - 45) {
          doc.addPage();
        } else {
          doc.moveDown(0.12);
        }

        const bullet = '•';
        const textWidth = doc.page.width - 45 - 57;

        // Render bullet glyph in Black (continued=true to draw text on the same line)
        doc.font('Helvetica').fontSize(9.5).fillColor('#000000');
        doc.text(bullet + '   ', 45, doc.y, { continued: true });

        // Temporarily change left margin to support native hanging indent/wrapping
        const originalLeftMargin = doc.page.margins.left;
        doc.page.margins.left = 57;

        // Render formatted text
        this.renderFormattedText(doc, itemText, { width: textWidth });
        
        // Restore left margin
        doc.page.margins.left = originalLeftMargin;
        doc.moveDown(0.12);
        lastWasSection = false;
      } else if (cleaned === '') {
        if (!lastWasSection) {
          doc.moveDown(0.18);
        }
      } else {
        // Normal paragraph (body text)
        if (doc.y > doc.page.height - 45) {
          doc.addPage();
        } else {
          doc.moveDown(0.2);
        }

        doc.font('Helvetica').fontSize(9.5).fillColor('#1f2937');

        this.renderFormattedText(doc, cleaned, { width: doc.page.width - 90 });
        doc.moveDown(0.12);
        lastWasSection = false;
      }
    }
  }

  private renderHeaderBlock(doc: PDFKit.PDFDocument, lines: string[]) {
    const cleanLines = lines.map(l => this.stripHtml(l.trim())).filter(l => l.length > 0);
    if (cleanLines.length === 0) return;

    // The first line is the candidate's Name (e.g. JULIO LIMA COSTA VALLADARES)
    const name = cleanLines[0].replace(/^#+\s*/, '').replace(/\\"/g, '"').replace(/\\'/g, "'").trim().toUpperCase();
    
    // Render Name (centered, Helvetica-Bold, large, Black)
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#000000').text(name, { align: 'center' });
    doc.moveDown(0.15);

    if (cleanLines.length > 1) {
      // Line 2: Headline / Role info
      const headline = cleanLines[1].replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
      doc.font('Helvetica').fontSize(10.5).fillColor('#1f2937').text(headline, { align: 'center' });
      doc.moveDown(0.2);
    }

    // Remaining lines: contact info and details lines
    for (let i = 2; i < cleanLines.length; i++) {
      const contactLine = cleanLines[i].replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
      doc.font('Helvetica').fontSize(8.5).fillColor('#4b5563').text(contactLine, { align: 'center', lineGap: 2 });
    }
    
    // Bottom padding after header block
    doc.moveDown(0.3);
  }

  private cleanText(text: string): string {
    // Replace markdown links [Text](url) with "Text (url)"
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  }

  private stripHtml(text: string): string {
    // Replace <a href="url">Text</a> with "Text"
    let cleaned = text.replace(/<a\s+href="[^"]*">([^<]*)<\/a>/gi, '$1');
    // Strip all other HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    return cleaned;
  }

  private renderFormattedText(
    doc: PDFKit.PDFDocument, 
    text: string, 
    options?: PDFKit.Mixins.TextOptions
  ) {
    const tokens = this.parseInlineFormatting(text);
    const opt = options || {};

    if (tokens.length === 0) {
      doc.text('', opt);
      return;
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const partOptions: PDFKit.Mixins.TextOptions = {
        ...opt,
        continued: i < tokens.length - 1
      };
      
      if (token.bold && token.italic) {
        doc.font('Helvetica-BoldOblique');
      } else if (token.bold) {
        doc.font('Helvetica-Bold');
      } else if (token.italic) {
        doc.font('Helvetica-Oblique');
      } else {
        doc.font('Helvetica');
      }

      doc.text(token.text, partOptions);
    }
  }

  private parseInlineFormatting(text: string): TextToken[] {
    const tokens: TextToken[] = [];
    let i = 0;
    let currentText = '';
    let bold = false;
    let italic = false;

    while (i < text.length) {
      if (text.substring(i, i + 2) === '**') {
        if (currentText) {
          tokens.push({ text: currentText, bold, italic });
          currentText = '';
        }
        bold = !bold;
        i += 2;
      } else if (text[i] === '*') {
        if (currentText) {
          tokens.push({ text: currentText, bold, italic });
          currentText = '';
        }
        italic = !italic;
        i += 1;
      } else {
        currentText += text[i];
        i += 1;
      }
    }
    if (currentText) {
      tokens.push({ text: currentText, bold, italic });
    }
    return tokens;
  }
}

export const pdfService = new PdfService();
