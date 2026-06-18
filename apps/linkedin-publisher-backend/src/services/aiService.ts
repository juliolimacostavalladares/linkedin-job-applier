import { config } from '../config';

export class AIService {
  static async generatePost(prompt: string, tone: string): Promise<string> {
    const systemInstruction = `Você é um especialista em marketing e criação de conteúdo no LinkedIn. 
Gere uma publicação com tom '${tone}' para o LinkedIn com base no prompt fornecido.
Instruções:
- Crie um hook inicial impactante (primeiras 2 linhas).
- Utilize quebras de linha para tornar a leitura fluida.
- Adicione emojis de forma equilibrada.
- Insira 3 a 4 hashtags relevantes no final.
- Evite placeholders como [Seu Nome], [Sua Empresa]. Deixe o texto pronto para ser publicado ou simule informações fictícias críveis de tecnologia.
- Fale em português do Brasil.`;

    const response = await fetch(`${config.nineRouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.nineRouter.apiKey ? { 'Authorization': `Bearer ${config.nineRouter.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.nineRouter.model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`NineRouter error: ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Retorno vazio da API do NineRouter');
    }

    return content.trim();
  }
}
