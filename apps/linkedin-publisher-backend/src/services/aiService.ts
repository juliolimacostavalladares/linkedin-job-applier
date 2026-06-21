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
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Retorno vazio da API do NineRouter');
      }
      return content.trim();
    }
  }
}
