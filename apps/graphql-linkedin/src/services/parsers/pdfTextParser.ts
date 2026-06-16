import type { WorkExperience, Education } from '@linkedin-job-applier/shared';

export interface ParsedPdf {
  about: string;
  experiences: WorkExperience[];
  education: Education[];
}

/**
 * Parses the plain-text content extracted from a LinkedIn profile PDF.
 *
 * The parser identifies well-known section headings (PT & EN), then builds
 * structured WorkExperience[] and Education[] arrays from the lines that
 * follow each heading.
 */
export function parsePdfText(text: string): ParsedPdf {
  // Normalise line endings and strip leading/trailing whitespace per line
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim());

  // ── Section heading patterns (LinkedIn PDFs in PT / EN) ───────────────────
  const SECTION_HEADINGS: RegExp[] = [
    /^(sobre|about|resumo|summary)$/i,
    /^(experi[eê]ncia|experience|experi[eê]ncias profissionais?)$/i,
    /^(forma[cç][aã]o|educa[cç][aã]o|education|academic)$/i,
    /^(habilidades|skills|competências)$/i,
    /^(idiomas?|languages?)$/i,
    /^(certificados?|certifications?|cursos?)$/i,
    /^(prêmios?|honras?|awards?)$/i,
    /^(voluntariado?|volunteer)$/i,
    /^(projetos?|projects?)$/i,
    /^(publica[cç][oõ]es?|publications?)$/i,
    /^(recomenda[cç][oõ]es?|recommendations?)$/i,
    /^(interesses?|interests?)$/i,
  ];

  const isHeading = (line: string): boolean =>
    SECTION_HEADINGS.some((rx) => rx.test(line.trim()));

  // ── Split the flat list of lines into named sections ──────────────────────
  interface Section {
    heading: string;
    lines: string[];
  }

  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    if (!line) continue;
    if (isHeading(line)) {
      if (current) sections.push(current);
      current = { heading: line.toLowerCase(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);

  // ── About ─────────────────────────────────────────────────────────────────
  const aboutSection = sections.find((s) =>
    /^(sobre|about|resumo|summary)$/i.test(s.heading),
  );
  const about = aboutSection?.lines.join(' ').trim() ?? '';

  // ── Experiences ───────────────────────────────────────────────────────────
  const expSection = sections.find((s) =>
    /^(experi[eê]ncia|experience|experi[eê]ncias profissionais?)$/i.test(
      s.heading,
    ),
  );
  const experiences: WorkExperience[] = [];

  if (expSection && expSection.lines.length > 0) {
    const DURATION_RX = /\d{4}|presente|current|hoje|now/i;
    const ROLE_SEP_RX = / · /;
    let i = 0;
    const expLines = expSection.lines;

    while (i < expLines.length) {
      // Skip empty lines
      while (i < expLines.length && !expLines[i]) i++;
      if (i >= expLines.length) break;

      let company = '';
      let role = '';
      let duration = '';
      const descLines: string[] = [];

      const first = expLines[i];

      if (ROLE_SEP_RX.test(first) && DURATION_RX.test(first)) {
        // "Role · Company · Duration" on a single line
        const parts = first.split(' · ');
        role = parts[0] ?? '';
        if (parts.length >= 3) {
          company = parts[1] ?? '';
          duration = parts.slice(2).join(' · ');
        } else {
          duration = parts[1] ?? '';
        }
        i++;
      } else {
        company = first;
        i++;

        if (i < expLines.length) {
          const second = expLines[i];
          if (ROLE_SEP_RX.test(second)) {
            // "Role · Duration" pattern
            const parts = second.split(' · ');
            role = parts[0] ?? '';
            duration = parts.slice(1).join(' · ');
            i++;
          } else if (DURATION_RX.test(second) && !ROLE_SEP_RX.test(second)) {
            // second line is a pure duration → first line was actually the role
            role = company;
            company = '';
            duration = second;
            i++;
          } else {
            // second line is the role title
            role = second;
            i++;
            if (i < expLines.length) {
              const third = expLines[i];
              if (DURATION_RX.test(third)) {
                duration = third;
                i++;
              }
            }
          }
        }
      }

      // Collect description lines until a new entry is detected
      while (
        i < expLines.length &&
        !isHeading(expLines[i]) &&
        !(DURATION_RX.test(expLines[i]) && !descLines.length)
      ) {
        const peek = expLines[i];
        if (
          descLines.length > 0 &&
          !DURATION_RX.test(peek) &&
          i + 1 < expLines.length &&
          DURATION_RX.test(expLines[i + 1])
        ) {
          break;
        }
        descLines.push(peek);
        i++;
      }

      if (role || company) {
        experiences.push({
          company,
          role,
          duration,
          description: descLines.join(' ').trim(),
        });
      }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  const eduSection = sections.find((s) =>
    /^(forma[cç][aã]o|educa[cç][aã]o|education|academic)$/i.test(s.heading),
  );
  const education: Education[] = [];

  if (eduSection && eduSection.lines.length > 0) {
    const YEAR_RX = /\b\d{4}\b/;
    let i = 0;
    const eduLines = eduSection.lines;

    while (i < eduLines.length) {
      while (i < eduLines.length && !eduLines[i]) i++;
      if (i >= eduLines.length) break;

      const institution = eduLines[i];
      i++;
      let degree = '';
      let duration = '';

      if (i < eduLines.length && !YEAR_RX.test(eduLines[i])) {
        degree = eduLines[i];
        i++;
      }
      if (i < eduLines.length && YEAR_RX.test(eduLines[i])) {
        duration = eduLines[i];
        i++;
      }

      // Skip extra activity/note lines until the next institution block
      while (
        i < eduLines.length &&
        !isHeading(eduLines[i]) &&
        !(
          i + 1 < eduLines.length &&
          !YEAR_RX.test(eduLines[i]) &&
          YEAR_RX.test(eduLines[i + 1] ?? '')
        )
      ) {
        if (
          !YEAR_RX.test(eduLines[i]) &&
          i + 2 < eduLines.length &&
          YEAR_RX.test(eduLines[i + 1] ?? '')
        ) {
          break;
        }
        if (
          !YEAR_RX.test(eduLines[i]) &&
          i + 1 < eduLines.length &&
          !YEAR_RX.test(eduLines[i + 1] ?? '') &&
          i + 2 < eduLines.length &&
          YEAR_RX.test(eduLines[i + 2] ?? '')
        ) {
          break;
        }
        i++;
      }

      if (institution) {
        education.push({ institution, degree, duration });
      }
    }
  }

  return { about, experiences, education };
}
