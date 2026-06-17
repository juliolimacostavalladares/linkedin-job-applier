import { config } from '../config';
import type { AIResponse, FormQuestion, ParsedResume } from '../types';

export class AIService {
  private async call9Router(prompt: string): Promise<string> {
    const response = await fetch(`${config.nineRouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.nineRouter.apiKey ? { 'Authorization': `Bearer ${config.nineRouter.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.nineRouter.model,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`9Router API error: ${response.status} ${response.statusText} - ${text}`);
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
        throw new Error('9Router returned an empty stream response');
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
        throw new Error('9Router returned an empty JSON response');
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

  async generateAnswers(questions: FormQuestion[], resume: string): Promise<AIResponse> {
    const prompt = this.buildPrompt(questions, resume);
    const text = await this.call9Router(prompt);
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

    const text = await this.call9Router(prompt);
    return this.cleanAndParseJson<ParsedResume>(text);
  }

  private buildPrompt(questions: FormQuestion[], resume: string): string {
    return `
Você é um assistente especialista em recrutamento. Dado o currículo do usuário e um formulário de candidatura a uma vaga, sugira a melhor resposta para cada pergunta baseada no currículo.

Currículo do Usuário:
${resume || 'Não informado'}

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
2. Para campos de texto livre, responda de forma profissional e concisa.
3. Se for do tipo 'file', apenas diga "Fazer upload do currículo".
4. Retorne APENAS o JSON válido.
`;
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

    const text = await this.call9Router(prompt);
    return text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '').trim();
  }
}

export const aiService = new AIService();
