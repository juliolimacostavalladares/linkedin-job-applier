import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LinkedInPost } from '../types';

interface PublisherState {
  posts: LinkedInPost[];
  selectedPost: LinkedInPost | null;
  loading: boolean;
  aiGenerating: boolean;
  
  createPost: (post: Omit<LinkedInPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePost: (id: string, updates: Partial<LinkedInPost>) => void;
  deletePost: (id: string) => void;
  setSelectedPost: (post: LinkedInPost | null) => void;
  publishPostNow: (id: string) => void;
  schedulePost: (id: string, date: string) => void;
  generateWithAi: (prompt: string, tone: string) => Promise<string>;
}

const INITIAL_MOCK_POSTS: LinkedInPost[] = [
  {
    id: 'post-1',
    text: `🚀 Muito feliz em anunciar que o nosso novo Robô Aplicador de Vagas do LinkedIn agora está 100% integrado ao GraphQL! 

Nessa nova arquitetura, o fluxo de envio ficou 5x mais rápido e totalmente livre de bloqueios, pois as credenciais de autenticação são colhidas localmente via extensão do Chrome.

O que isso muda na prática?
1. Mais velocidade no envio de candidaturas.
2. Segurança reforçada (seus dados nunca saem da sua máquina).
3. Respostas otimizadas por IA com base real na descrição da vaga.

Agradeço ao time pelo empenho nessa entrega! Em breve traremos insights sobre conversão de entrevistas. #dev #software #remoto #tech`,
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    mediaName: 'graphql_integration_architecture.png',
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      views: 1250,
      likes: 84,
      comments: 15,
      shares: 4
    }
  },
  {
    id: 'post-2',
    text: `💡 Dica rápida de Engenharia de Software: DRY vs KISS.

Muitas vezes, na pressa de não duplicar código (DRY), acabamos criando abstrações extremamente complexas que ferem diretamente o princípio da simplicidade (KISS).

Se uma duplicidade de 5 linhas poupa você de criar um Generic Helper de 100 linhas com 3 níveis de indireção e callbacks... apenas duplique. A legibilidade a longo prazo agradece.

Como diz Sandy Metz: "A duplicidade é muito mais barata do que a abstração errada." 

Concorda ou discorda? 👇`,
    type: 'text',
    status: 'published',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      views: 3120,
      likes: 245,
      comments: 42,
      shares: 12
    }
  },
  {
    id: 'post-3',
    text: `📅 [AGENDADO] Na próxima segunda-feira vou compartilhar um guia completo de como otimizar seu currículo para passar pelos robôs de ATS utilizando inteligência artificial de forma ética.

Fique de olho pois postarei o PDF completo para download direto! 🔥`,
    type: 'link',
    mediaUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-4',
    text: `📝 Rascunho de postagem sobre os principais erros em testes automatizados. Focar em:
1. Testar detalhes de implementação ao invés de comportamento.
2. Abuso de Mocks de banco de dados.
3. Testes frágeis (flaky tests) sem timeout correto.`,
    type: 'text',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const usePublisherStore = create<PublisherState>()(
  persist(
    (set, get) => ({
      posts: INITIAL_MOCK_POSTS,
      selectedPost: null,
      loading: false,
      aiGenerating: false,

      createPost: (post) => set((state) => {
        const newPost: LinkedInPost = {
          ...post,
          id: `post-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metrics: post.status === 'published' ? { views: 0, likes: 0, comments: 0, shares: 0 } : undefined
        };
        return {
          posts: [newPost, ...state.posts],
          selectedPost: newPost
        };
      }),

      updatePost: (id, updates) => set((state) => {
        const updatedPosts = state.posts.map((post) => {
          if (post.id === id) {
            const updated = {
              ...post,
              ...updates,
              updatedAt: new Date().toISOString()
            };
            if (updates.status === 'published' && !updated.publishedAt) {
              updated.publishedAt = new Date().toISOString();
              updated.metrics = updated.metrics || { views: 0, likes: 0, comments: 0, shares: 0 };
            }
            return updated;
          }
          return post;
        });

        // Sync selectedPost if it was the one updated
        const nextSelected = state.selectedPost && state.selectedPost.id === id
          ? updatedPosts.find(p => p.id === id) || null
          : state.selectedPost;

        return {
          posts: updatedPosts,
          selectedPost: nextSelected
        };
      }),

      deletePost: (id) => set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
        selectedPost: state.selectedPost?.id === id ? null : state.selectedPost
      })),

      setSelectedPost: (post) => set({ selectedPost: post }),

      publishPostNow: (id) => get().updatePost(id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        scheduledAt: undefined
      }),

      schedulePost: (id, date) => get().updatePost(id, {
        status: 'scheduled',
        scheduledAt: date,
        publishedAt: undefined
      }),

      generateWithAi: async (prompt, tone) => {
        set({ aiGenerating: true });
        // Simular chamada de IA com setTimeout
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        let response = '';
        const lowerPrompt = prompt.toLowerCase();
        
        // Geração inteligente baseada no prompt
        if (lowerPrompt.includes('contratação') || lowerPrompt.includes('vaga') || lowerPrompt.includes('oportunidade')) {
          response = `📣 Estamos contratando! Oportunidade incrível de desenvolvimento na nossa equipe de tecnologia.

Buscamos pessoas apaixonadas por resolver problemas complexos com código limpo e escalável. 

Diferenciais do nosso time:
• Cultura focada em autonomia e aprendizado contínuo.
• Tech stack moderna (React, Node, GraphQL, Turborepo).
• Trabalho 100% remoto com horários flexíveis.

Interessado(a) ou conhece alguém? Link para candidatura na descrição! 👇 #vagas #oportunidade #tech #desenvolvimento`;
        } else if (lowerPrompt.includes('aprendizado') || lowerPrompt.includes('carreira') || lowerPrompt.includes('dica')) {
          response = `📚 O aprendizado contínuo é a única constante na área de tecnologia.

Se você parar de estudar por 6 meses, a sensação é de estar 2 anos desatualizado. Mas o segredo não é tentar abraçar todo novo framework que surge, e sim dominar os fundamentos:

1. Estrutura de dados e Algoritmos.
2. Padrões de Arquitetura de Software.
3. Protocolos de rede e APIs.
4. Boas práticas de Clean Code e Testes.

Quando você entende os conceitos por trás das ferramentas, aprender uma nova linguagem torna-se apenas uma questão de sintaxe.

Qual foi o último fundamento que você estudou a fundo? 💻`;
        } else {
          response = `🚀 ${prompt}

Escrevendo com tom ${tone}... 

Este é um conteúdo estruturado para maximizar engajamento orgânico no LinkedIn, utilizando quebras de linha estratégicas para melhorar a legibilidade e hashtags direcionadas. 

Espero que faça sentido para a sua rede! Deixe suas impressões nos comentários. 👇 #tecnologia #engajamento #produtividade`;
        }

        set({ aiGenerating: false });
        return response;
      }
    }),
    {
      name: 'linkedin-publisher-storage',
      partialize: (state) => ({
        posts: state.posts
      })
    }
  )
);
