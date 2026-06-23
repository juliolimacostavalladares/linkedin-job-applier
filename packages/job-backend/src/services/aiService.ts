import { config } from '../config';
import type { AIResponse, FormQuestion, ParsedResume } from '../types';
import { detectLanguageFromText } from '../utils/language';

export class AIService {
  private async callAI(prompt: string): Promise<string> {
    const { provider, nineRouter, ollama } = config.ai;
    const baseUrl = provider === 'ollama' ? ollama.baseUrl : nineRouter.baseUrl;
    const apiKey = provider === 'ollama' ? '' : nineRouter.apiKey;
    const model = provider === 'ollama' ? ollama.model : nineRouter.model;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${provider === 'ollama' ? 'Ollama' : '9Router'} API error: ${response.status} ${response.statusText} - ${text}`);
    }

    const text = await response.text();
    const isStream = text.includes('data: ') || response.headers.get('content-type')?.includes('event-stream');

    if (isStream) {
      let accumulatedContent = '';
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(dataStr) as {
              choices?: Array<{
                delta?: {
                  content?: string;
                };
                text?: string;
              }>;
            };
            const chunk = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text;
            if (chunk) {
              accumulatedContent += chunk;
            }
          } catch {
            // Ignore parse errors for partial/malformed lines in buffer
          }
        }
      }
      const trimmedResult = accumulatedContent.trim();
      if (!trimmedResult) {
        throw new Error(`${provider === 'ollama' ? 'Ollama' : '9Router'} returned an empty stream response`);
      }
      return trimmedResult;
    } else {
      const data = JSON.parse(text) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error(`${provider === 'ollama' ? 'Ollama' : '9Router'} returned an empty JSON response`);
      }
      return content;
    }
  }

  private cleanAndParseJson<T>(text: string): T {
    const cleaned = text
      .replace(/^```[a-z]*\n/i, '')
      .replace(/\n```$/, '')
      .trim();
    return JSON.parse(cleaned) as T;
  }

  async generateAnswers(
    questions: FormQuestion[], 
    resume: string, 
    jobContext?: { title?: string; companyName?: string; description?: string }
  ): Promise<AIResponse> {
    const prompt = this.buildPrompt(questions, resume, jobContext);
    const text = await this.callAI(prompt);
    return this.cleanAndParseJson<AIResponse>(text);
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    const prompt = `
Você é um assistente especialista em recrutamento. Extraia e estruture as informações do currículo do usuário (geralmente gerado a partir do perfil do LinkedIn) nas seguintes seções:
1. "about": Um resumo profissional conciso.
2. "experiences": Uma lista das experiências de trabalho estruturadas. Cada item deve conter:
   - "company": Nome da empresa.
   - "role": Cargo.
   - "duration": Período (ex: "Jan 2020 - Presente" ou "Jan 2020 - Dez 2023").
   - "description": Descrição das atividades e realizações neste cargo.
3. "education": Uma lista das formações acadêmicas estruturadas. Cada item deve conter:
   - "institution": Nome da instituição de ensino.
   - "degree": Curso/Grau obtido (ex: "Bacharelado em Engenharia de Software").
   - "duration": Período (ex: "2016 - 2020").

Texto do currículo:
${resumeText}

Retorne um JSON válido e estrito no formato abaixo, sem tags markdown ou explicações fora do JSON:
{
  "about": "Resumo profissional...",
  "experiences": [
    {
      "company": "Nome da Empresa",
      "role": "Nome do Cargo",
      "duration": "Período",
      "description": "Descrição das atividades..."
    }
  ],
  "education": [
    {
      "institution": "Nome da Instituição",
      "degree": "Nome do Curso/Grau",
      "duration": "Período"
    }
  ]
}
`;

    const text = await this.callAI(prompt);
    return this.cleanAndParseJson<ParsedResume>(text);
  }

  private buildPrompt(
    questions: FormQuestion[], 
    resume: string,
    jobContext?: { title?: string; companyName?: string; description?: string }
  ): string {
    const lang = detectLanguageFromText(jobContext?.description ?? '');
    const isEn = lang === 'en';

    const jobInfo = jobContext 
      ? `${isEn ? 'Job Title' : 'Vaga'}: ${jobContext.title || (isEn ? 'Not provided' : 'Não informada')}\n${isEn ? 'Company' : 'Empresa'}: ${jobContext.companyName || (isEn ? 'Not provided' : 'Não informada')}\n${isEn ? 'Job Description' : 'Descrição da Vaga'}:\n${jobContext.description || (isEn ? 'Not provided' : 'Não informada')}`
      : (isEn ? 'Not provided' : 'Não informada');

    if (isEn) {
      return `
You are an expert recruitment assistant. Given the user's resume, job information (if available) and an application form, suggest the best answer for each question based on the resume.

⚠️ IMPORTANT: The job posting is in English. ALL answers must be written in English, regardless of the language of the user's resume.

User Resume:
${resume || 'Not provided'}

Job Information:
${jobInfo}

Form Questions:
${JSON.stringify(questions, null, 2)}

Return a JSON with the suggested answers. Exact format:
{
  "answers": [
    { "urn": "field_urn", "answer": "suggested answer" }
  ]
}
Rules:
1. For selection fields (dropdown/checkbox/typeahead), choose the best option based on the "options" provided. If there is no exact match, choose the closest one.
2. For free-text fields, respond professionally and concisely in English.
3. If the question is about a Cover Letter, Message to hiring manager, or Motivation ("Why do you want to work here?", etc.), write a personalized 3–5 sentence response in English, highlighting the match between the user's experience and the job requirements. NEVER write lazy phrases like "Please find my resume attached". Create a warm, professional, tailor-made message!
4. If the type is 'file', just say "Upload resume".
5. Return ONLY the valid JSON.
`;
    }

    return `
Você é um assistente especialista em recrutamento. Dado o currículo do usuário, as informações da vaga (se disponíveis) e um formulário de candidatura a uma vaga, sugira a melhor resposta para cada pergunta baseada no currículo.

⚠️ IMPORTANTE: A vaga está em português. TODAS as respostas devem ser escritas em português, independente do idioma do currículo.

Currículo do Usuário:
${resume || 'Não informado'}

Informações da Vaga:
${jobInfo}

Perguntas do Formulário:
${JSON.stringify(questions, null, 2)}

Retorne um JSON contendo as respostas sugeridas. Formato exato:
{
  "answers": [
    { "urn": "urn_do_campo", "answer": "resposta sugerida" }
  ]
}
Regras:
1. Para campos de seleção (dropdown/checkbox/typeahead), escolha a melhor opção baseada nos "options" passados. Se não houver exata, escolha a mais próxima.
2. Para campos de texto livre, responda de forma profissional e concisa em português.
3. Se a pergunta for sobre Carta de Apresentação ("Cover Letter", "Message to hiring manager", etc.) ou Motivação ("Why do you want to work here?", "Por que você quer trabalhar aqui?", "Por que devemos te contratar?", etc.), escreva uma resposta personalizada de 3 a 5 frases completas e persuasivas em português, destacando a compatibilidade entre as experiências do currículo do usuário e os requisitos da vaga. NUNCA use frases curtas ou preguiçosas como "Please find my resume attached" ou "Tenho interesse". Crie uma mensagem calorosa, profissional e sob medida!
4. Se for do tipo 'file', apenas diga "Fazer upload do currículo".
5. Retorne APENAS o JSON válido.
`;
  }

  async optimizeResume(resumeText: string, jobDescription: string): Promise<string> {
    const lang = detectLanguageFromText(jobDescription);
    const isEn = lang === 'en';

    if (isEn) {
      const prompt = `
You are an expert in recruitment and ATS resume optimization.
Your task is to generate a complete, optimized resume for the job described below.

⚠️ IMPORTANT: The job posting is in English. The ENTIRE resume must be written in English, regardless of the original language of the user's resume. Translate all content to English.

User Base Resume:
${resumeText}

Job Description:
${jobDescription}

══════════════════════════════════════════════
OPTIMIZATION GUIDELINES
══════════════════════════════════════════════
1. Identify keywords, skills and competencies from the job posting.
2. Adapt the summary and achievements to highlight those keywords.
3. Do NOT invent experiences that don't exist in the original resume.
4. Do NOT use emojis. Formal, ATS-friendly content only.
5. In the EDUCATION section, include ONLY formations directly relevant to the job area. Omit unrelated ones — unless it's the only education listed.
6. NEVER invent personal information not explicitly in the original resume. This includes: date of birth, address, phone, email, LinkedIn, availability, contract type. If information is not in the base resume, simply omit it from the header.

══════════════════════════════════════════════
MANDATORY OUTPUT FORMAT
══════════════════════════════════════════════
The resume must start with an HTML HEADER BLOCK, followed by the body in pure Markdown.

HEADER (use exactly this HTML format, replacing values):
<div style="font-size: 2.5em; font-weight: bold; margin-top: -20px; margin-bottom: 5px;">FULL NAME IN UPPERCASE</div>
<div style="font-size: 1.1em; margin-bottom: 10px;">Primary Role | Main specialties from the job</div>
<div style="font-size: 0.9em; margin-bottom: 2px;">Location | Phone | email@example.com | LinkedIn</div>
<div style="font-size: 0.9em;">Date of Birth: MM/DD/YYYY | Availability: Remote | Contract: Full-time</div>

BODY (pure Markdown after the header):
- Use \`---\` for horizontal dividers between sections
- Section titles: \`### SECTION NAME\` in uppercase
- Role/company: \`**Role | Company**\`
- Period: \`*Month Year – Month Year (duration) | Location*\`
- Achievements: list with \`*   **Title:** Detailed description.\`
- Skills: list with \`*   **Category:** item1, item2, item3.\`
- Education: list with \`*   **Degree/Course** | Institution (Period)\`
- Use **bold** strategically for important keywords

SECTION STRUCTURE (in this order):
1. HTML header block (above)
2. ---
3. ### PROFESSIONAL SUMMARY
4. ---
5. ### PROFESSIONAL EXPERIENCE
6. ---
7. ### TECHNICAL SKILLS
8. ---
9. ### EDUCATION

Return ONLY the resume text (HTML header + Markdown body), without explanations, introductions or code blocks.
`;
      const text = await this.callAI(prompt);
      return text.trim();
    }

    const prompt = `
Você é um especialista em recrutamento e otimização de currículos para sistemas ATS.
Sua tarefa é gerar um currículo completo e otimizado para a vaga descrita abaixo.

⚠️ IMPORTANTE: A vaga está em português. O currículo INTEIRO deve ser escrito em português.

Currículo Base do Usuário:
${resumeText}

Descrição da Vaga:
${jobDescription}

══════════════════════════════════════════════
DIRETRIZES DE OTIMIZAÇÃO
══════════════════════════════════════════════
1. Identifique as palavras-chave, habilidades e competências da vaga.
2. Adapte o resumo e as realizações para destacar essas palavras-chave.
3. NÃO invente experiências que não existam no currículo original.
4. NÃO use emojis. Conteúdo formal e adequado para ATS.
5. Na seção FORMAÇÃO ACADÊMICA, inclua APENAS as formações diretamente relevantes para a área da vaga. Omita formações sem relação com a vaga — a menos que sejam a única formação existente no currículo.
6. NUNCA invente informações pessoais que não estejam explicitamente no currículo original. Isso inclui: data de nascimento, endereço, telefone, e-mail, LinkedIn, disponibilidade, regime de contrato. Se uma informação não estiver no currículo base, simplesmente omita-a do cabeçalho.

══════════════════════════════════════════════
FORMATO OBRIGATÓRIO DE SAÍDA
══════════════════════════════════════════════
O currículo deve começar com um BLOCO DE CABEÇALHO em HTML inline, seguido do corpo em Markdown puro.

CABEÇALHO (use exatamente este formato HTML, substituindo os valores):
<div style="font-size: 2.5em; font-weight: bold; margin-top: -20px; margin-bottom: 5px;">NOME COMPLETO EM MAIÚSCULAS</div>
<div style="font-size: 1.1em; margin-bottom: 10px;">Cargo Principal | Especialidades principais da vaga</div>
<div style="font-size: 0.9em; margin-bottom: 2px;">Endereço | Telefone | email@exemplo.com | LinkedIn</div>
<div style="font-size: 0.9em;">Nascimento: DD/MM/AAAA | Disponibilidade: Remoto | Regime: CLT/PJ</div>

CORPO (use Markdown puro após o cabeçalho):
- Use \`---\` para divisórias horizontais entre seções
- Títulos de seção: \`### NOME DA SEÇÃO\` em maiúsculas
- Cargo/empresa: \`**Cargo | Empresa**\`
- Período: \`*Mês Ano – Mês Ano (duração) | Localização*\`
- Realizações: lista com \`*   **Título:** Descrição detalhada.\`
- Habilidades: lista com \`*   **Categoria:** item1, item2, item3.\`
- Formação: lista com \`*   **Curso/Grau** | Instituição (Período)\`
- Use **negrito** estrategicamente para palavras-chave importantes

ESTRUTURA DAS SEÇÕES (nesta ordem):
1. Bloco de cabeçalho HTML (acima)
2. ---
3. ### RESUMO PROFISSIONAL
4. ---
5. ### EXPERIÊNCIA PROFISSIONAL
6. ---
7. ### HABILIDADES TÉCNICAS
8. ---
9. ### FORMAÇÃO ACADÊMICA

Retorne APENAS o texto do currículo (HTML header + Markdown body), sem explicações, introduções ou blocos de código.
`;

    const text = await this.callAI(prompt);
    return text.trim();
  }

  async generateSearchQuery(resumeText: string): Promise<string> {
    const prompt = `
Você é um assistente especialista em recrutamento. Com base no currículo do usuário, gere uma query booleana otimizada para pesquisa de vagas no LinkedIn.
A query deve ser estruturada com operadores booleanos (AND, OR, NOT) e parênteses, seguindo exatamente o estilo abaixo de acordo com a senioridade e a área do usuário:

Exemplo de formato esperado:
(senior OR sênior) ("Front-end" OR "Desenvolvedor Front-end" OR "Programador") AND (React OR Next.js OR TypeScript)

Diretrizes importantes:
1. Comece com o nível de senioridade fora dos parênteses principais dos cargos. Se for nível Senior, use obrigatoriamente a expressão "(senior OR sênior)" para abranger ambas as grafias comuns (com e sem acento). Para outros níveis, siga o mesmo padrão (ex: "pleno" ou "júnior").
2. No primeiro grupo parentesado com OR, liste de 2 a 3 cargos equivalentes/sinônimos da função do usuário (ex: ("Front-end" OR "Desenvolvedor Front-end" OR "Programador")).
3. No segundo grupo parentesado com OR (ligado por AND ao primeiro), liste de 2 a 3 tecnologias ou linguagens centrais e mais comuns do usuário (ex: (React OR Next.js OR TypeScript)). Evite incluir termos raros, muito específicos ou genéricos (como "AI Integration" ou "Arquitetura"), foque apenas nas 2-3 tecnologias principais do usuário para manter a busca abrangente.
4. ATENÇÃO: NÃO inclua grupos com operador NOT (ex: NOT (English OR Presencial OR Hibrido)). Os anúncios de vagas frequentemente contêm essas palavras em frases como "não presencial" ou "diferencial inglês", e excluí-las fará com que excelentes vagas válidas sejam omitidas dos resultados de busca do LinkedIn.
5. Retorne APENAS a string da query pura, sem formatação markdown (sem \`\`\` ou \`\`), explicações ou introduções.

Texto do currículo do usuário:
${resumeText}
`;

    const text = await this.callAI(prompt);
    return text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '').trim();
  }
}

export const aiService = new AIService();
