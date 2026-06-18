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
      const lowerTrimmed = trimmed.toLowerCase().replace(/[:#*_-]/g, '').trim();

      if (
        trimmed.startsWith('## ') || 
        trimmed.startsWith('### ') || 
        trimmed.startsWith('- ') || 
        trimmed.startsWith('* ') ||
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
      const cleaned = this.cleanText(trimmed);
      const lowerCleaned = cleaned.toLowerCase().replace(/[:#*_-]/g, '').trim();

      if (cleaned.startsWith('## ') || (!cleaned.startsWith('#') && commonSectionTitles.includes(lowerCleaned))) {
        // Section Title (H2)
        const titleText = cleaned.replace(/^##\s*/, '').replace(/:$/, '').trim();
        
        // Add vertical spacing
        if (doc.y > 100) {
          doc.moveDown(1.2);
        } else {
          doc.moveDown(0.4);
        }

        // Avoid page break right after section title
        if (doc.y > doc.page.height - 120) {
          doc.addPage();
        }

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e3a8a').text(titleText);
        
        // Draw elegant thin underline
        const y = doc.y + 3;
        doc.moveTo(45, y)
           .lineTo(doc.page.width - 45, y)
           .strokeColor('#cbd5e1')
           .lineWidth(0.5)
           .stroke();
           
        doc.moveDown(0.6);
        lastWasSection = true;
      } else if (cleaned.startsWith('### ')) {
        // Sub-section (H3 - like Company name or institution)
        const subTitleText = cleaned.replace(/^###\s*/, '').trim();
        
        // Avoid page break right after sub-section title
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
        } else {
          doc.moveDown(0.5);
        }

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b').text(subTitleText);
        doc.moveDown(0.2);
        lastWasSection = false;
      } else if (cleaned.startsWith('- ') || cleaned.startsWith('* ')) {
        // Bullet point
        const itemText = cleaned.substring(2).trim();
        
        // Avoid orphan lines
        if (doc.y > doc.page.height - 45) {
          doc.addPage();
        } else {
          doc.moveDown(0.15);
        }

        const bullet = '•';
        const bulletWidth = 12;
        const textX = 45 + bulletWidth;
        const textWidth = doc.page.width - 45 - textX;
        const originalY = doc.y;

        // Render bullet glyph in Navy Blue
        doc.font('Helvetica').fontSize(9.5).fillColor('#1e3a8a');
        doc.text(bullet, 45, originalY, { width: bulletWidth });

        // Render formatted text with hanging indent aligned with bullet's Y coordinate
        this.renderFormattedText(doc, itemText, textX, originalY, { width: textWidth });
        doc.moveDown(0.15);
        lastWasSection = false;
      } else if (cleaned === '') {
        if (!lastWasSection) {
          doc.moveDown(0.25);
        }
      } else {
        // Normal paragraph (body text or metadata like Job Title | Dates)
        if (doc.y > doc.page.height - 45) {
          doc.addPage();
        } else {
          doc.moveDown(0.25);
        }

        const isMetadata = cleaned.includes('|') || cleaned.startsWith('**') || cleaned.includes(' - ');
        const fontSize = isMetadata ? 8.5 : 9.5;
        const textColor = isMetadata ? '#64748b' : '#334155';

        doc.font('Helvetica').fontSize(fontSize).fillColor(textColor);
        
        if (isMetadata && doc.y > doc.page.height - 60) {
          doc.addPage();
        }

        this.renderFormattedText(doc, cleaned, 45, undefined, { width: doc.page.width - 90 });
        doc.moveDown(0.15);
        lastWasSection = false;
      }
    }
  }

  private renderHeaderBlock(doc: PDFKit.PDFDocument, lines: string[]) {
    const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0);
    if (cleanLines.length === 0) return;

    // The first line is the candidate's Name
    const name = cleanLines[0].replace(/^#\s*/, '').trim();
    let headline = '';
    const contactItems: string[] = [];

    for (let i = 1; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('@')) {
        contactItems.push(line);
      } else if (lowerLine.includes('linkedin.com') || lowerLine.includes('linkedin:')) {
        const cleanUrl = line
          .replace(/^(linkedin:\s*)/i, '')
          .replace(/https?:\/\/(www\.)?/, '')
          .trim();
        contactItems.push(cleanUrl);
      } else if (lowerLine.includes('github.com') || lowerLine.includes('github:')) {
        const cleanUrl = line
          .replace(/^(github:\s*)/i, '')
          .replace(/https?:\/\/(www\.)?/, '')
          .trim();
        contactItems.push(cleanUrl);
      } else if (
        line.match(/\+?\d[\d\s()-.]{7,}\d/) || 
        lowerLine.includes('phone') || 
        lowerLine.includes('tel') ||
        lowerLine.includes('telefone')
      ) {
        contactItems.push(line.replace(/^(phone|tel|telefone):\s*/i, ''));
      } else if (
        lowerLine.includes('remote') || 
        lowerLine.includes('remoto') || 
        lowerLine.includes('híbrido') || 
        lowerLine.includes('hybrid') ||
        lowerLine.includes('brasil') || 
        lowerLine.includes('brazil') ||
        line.includes(',')
      ) {
        contactItems.push(line.replace(/^(location|localização):\s*/i, ''));
      } else {
        if (i === 1 && !headline && line.length < 100) {
          headline = line;
        } else {
          contactItems.push(line);
        }
      }
    }

    // Render Name (centered, Slate-900)
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text(name, { align: 'center' });
    doc.moveDown(0.2);

    // Render Headline (centered, italic)
    if (headline) {
      doc.font('Helvetica-Oblique').fontSize(10.5).fillColor('#475569').text(headline, { align: 'center' });
      doc.moveDown(0.3);
    }

    // Render Contact Items in a clean single line separated by mid-dots
    if (contactItems.length > 0) {
      const contactText = contactItems.join('   •   ');
      doc.font('Helvetica').fontSize(8.5).fillColor('#64748b').text(contactText, { align: 'center', lineGap: 3 });
    }
    
    // Bottom padding after header block
    doc.moveDown(0.8);
  }

  private cleanText(text: string): string {
    // Replace markdown links [Text](url) with "Text (url)"
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  }

  private renderFormattedText(
    doc: PDFKit.PDFDocument, 
    text: string, 
    x?: number, 
    y?: number, 
    options?: PDFKit.Mixins.TextOptions
  ) {
    const tokens = this.parseInlineFormatting(text);
    const opt = options || {};

    if (tokens.length === 0) {
      if (x !== undefined && y !== undefined) {
        doc.text('', x, y, opt);
      } else if (x !== undefined) {
        doc.text('', x, doc.y, opt);
      } else {
        doc.text('', opt);
      }
      return;
    }

    const startY = y !== undefined ? y : doc.y;
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

      if (i === 0 && x !== undefined) {
        doc.text(token.text, x, startY, partOptions);
      } else {
        doc.text(token.text, partOptions);
      }
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
