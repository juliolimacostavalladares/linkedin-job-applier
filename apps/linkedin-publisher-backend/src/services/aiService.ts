import { config } from '../config';

export class AIService {
  static async generatePost(prompt: string, tone: string): Promise<string> {
    const systemInstruction = `Você é um especialista em marketing e criação de conteúdo no LinkedIn. 
Gere uma publicação com tom '${tone}' para o LinkedIn com base no prompt fornecido.

Diretrizes de Formatação e Acessibilidade (ESSENCIAL):
- O Gancho Inicial: As primeiras 3 linhas devem conter a frase mais impactante e persuasiva da publicação, pois o LinkedIn oculta o restante com o botão "ver mais".
- Respirabilidade e Quebras de Linha: Deixe sempre uma linha em branco entre cada frase ou parágrafo curto. Evite blocos densos de texto, garantindo que a leitura seja agradável e escaneável no celular.
- Formatação de Texto via Markdown: Você DEVE usar marcadores padrão do Markdown para destacar palavras-chave e títulos importantes (use **negrito** para termos importantes e títulos, *itálico* para ênfase leve, e ~~tachado~~ se necessário). Nosso sistema converterá automaticamente essas marcações em caracteres especiais Unicode formatados antes de publicar. Não use caracteres especiais Unicode diretamente na resposta (como 𝗯𝗼𝗹𝗱), apenas use as marcações do Markdown (**negrito**, *itálico*, ~~tachado~~).
- Adicione emojis de forma equilibrada no início de parágrafos ou como tópicos.
- Insira 3 a 4 hashtags relevantes no final.
- Evite placeholders como [Seu Nome] ou [Sua Empresa]. O texto deve vir pronto para publicação direta.
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
