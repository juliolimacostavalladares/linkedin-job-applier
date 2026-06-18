/**
 * Utility functions for detecting language of jobs.
 */

export function detectLanguageFromText(text: string): 'en' | 'pt' {
  if (!text || text.length < 50) return 'pt';
  const sample = text.slice(0, 800).toLowerCase();
  const enWords = ['the', 'and', 'for', 'with', 'you', 'our', 'will', 'are', 'your', 'we', 'this', 'have', 'that', 'from', 'not', 'be', 'at', 'by', 'an', 'or', 'is', 'in', 'to', 'of', 'it', 'as'];
  const ptWords = ['para', 'com', 'que', 'uma', 'você', 'nosso', 'será', 'são', 'seu', 'nós', 'este', 'ter', 'esse', 'de', 'do', 'da', 'em', 'na', 'no', 'os', 'as', 'um', 'por'];
  const enCount = enWords.filter(w => new RegExp(`\\b${w}\\b`).test(sample)).length;
  const ptCount = ptWords.filter(w => new RegExp(`\\b${w}\\b`).test(sample)).length;
  return enCount > ptCount ? 'en' : 'pt';
}

export function detectLanguageFromTitle(title: string): 'en' | 'pt' {
  if (!title) return 'pt';
  const titleLower = title.toLowerCase();
  
  // Key Portuguese terms/indicators in titles
  const ptKeywords = [
    'desenvolvedor', 'desenvolvedora', 'analista', 'estagiário', 'estagiária', 'estagio', 'estágio',
    'gerente', 'engenheiro', 'engenheira', 'coordenador', 'coordenadora', 'líder', 'lider',
    'técnico', 'tecnica', 'suporte', 'programador', 'programadora', 'especialista', 'vaga',
    'banco de talentos', 'exclusiva', 'exclusivo', 'tecnologia', 'sistemas', 'dados', 'infraestrutura',
    'segurança', 'desenvolvimento', 'estagiario', 'estagio', 'clt', 'pj'
  ];
  
  const hasPtKeyword = ptKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(titleLower);
  });
  
  return hasPtKeyword ? 'pt' : 'en';
}
