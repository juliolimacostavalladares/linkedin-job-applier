import { config } from '../config';
import type { AIResponse, FormQuestion, ParsedResume } from '../types';

export class AIService {
  async generateAnswers(questions: FormQuestion[], resume: string): Promise<AIResponse> {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

    const prompt = this.buildPrompt(questions, resume);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Resposta vazia do Gemini');
    }
    return JSON.parse(text);
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Resposta vazia do Gemini ao analisar o currículo');
    }
    return JSON.parse(text) as ParsedResume;
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
}

export const aiService = new AIService();


