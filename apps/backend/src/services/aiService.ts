import { config } from '../config';
import type { AIResponse, FormQuestion } from '../types';

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
