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

  static async generateCarousel(prompt: string, tone: string): Promise<string> {
    const systemInstruction = `Você é um designer e copywriter especialista em criar carrosséis de alto engajamento no LinkedIn.
Sua tarefa é gerar o conteúdo de um carrossel em formato JSON estruturado com base no tema fornecido pelo usuário. Tom solicitado: '${tone}'.

Estrutura do JSON a ser retornado (retorne APENAS o JSON válido, sem blocos de código markdown como \`\`\`json ou texto explicativo):
{
  "title": "Título principal do carrossel (curto e chamativo)",
  "slides": [
    {
      "type": "cover",
      "title": "Título da Capa (super impactante, máx 10 palavras)",
      "subtitle": "Subtítulo da capa para incentivar o clique/arrastar"
    },
    {
      "type": "content", // Para listas em tópicos (bullet points)
      "title": "Título do Slide",
      "content": "Ponto 1\\nPonto 2\\nPonto 3 (conteúdo resumido e direto, use \\n para separar os tópicos)"
    },
    {
      "type": "code", // Para exemplos de código (snippets de código reais)
      "title": "Título do Slide de Código",
      "code": "const x = 10;\\nconsole.log(x); // Exemplo de código",
      "language": "javascript" // Opcional (ex: javascript, typescript, python, html, css, json)
    },
    {
      "type": "text", // Para parágrafos explicativos, citações, estatísticas ou tabelas comparativas
      "title": "Título do Slide de Texto/Tabela",
      "content": "Texto explicativo corrido ou uma tabela markdown comparativa. Exemplo de tabela:\\n| Feature | React | Vue |\\n|---|---|---|\\n| Speed | Fast | Fast |"
    },
    {
      "type": "cta",
      "title": "Chamada para Ação (CTA)",
      "subtitle": "Ex: Siga meu perfil para mais dicas diárias de tecnologia e engajamento!"
    }
  ]
}

Diretrizes importantes:
- Analise o tema solicitado pelo usuário e decida estrategicamente quais tipos de slides usar:
  - Se for um tutorial ou dica técnica de programação/infra, use de forma de destaque slides do tipo "code" para exemplos de código.
  - Se for uma comparação, estatística, ou explicação de conceitos, use slides do tipo "text" (ou crie tabelas markdown comparativas curtas).
  - Use o tipo "content" para listas de tópicos tradicionais em formato de bullet points.
- Gere entre 5 a 8 slides no total (1 Capa, 3 a 6 slides de conteúdo variando de forma inteligente entre 'content', 'code' e 'text', 1 CTA).
- Mantenha os textos curtos e focados na leitura rápida por celular.
- Use emojis moderadamente nos pontos.
- O retorno deve ser um JSON perfeitamente válido para podermos rodar JSON.parse() diretamente.`;

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

    let content = '';
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
            // Ignore parse errors
          }
        }
      }
      content = accumulatedContent.trim();
    } else {
      const data = JSON.parse(text) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };
      content = (data.choices?.[0]?.message?.content || '').trim();
    }

    if (!content) {
      throw new Error('Retorno vazio da API do NineRouter');
    }

    // Clean any markdown formatting if the model outputs them anyway
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  }
}
