# LinkedIn Posts API - Documentação

## Resumo

Sistema de publicação de posts no LinkedIn implementado seguindo o padrão GraphQL interno do LinkedIn, similar ao sistema de jobs já existente.

## Arquitetura

### 1. GraphQL Service (`@graphql-linkedin`)
Serviço GraphQL que faz chamadas diretas à API interna do LinkedIn.

**Localização:** `apps/graphql-linkedin/src/services/fetchers/postPublisher.ts`

**Endpoint LinkedIn:**
```
https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=voyagerContentcreationDashShares.279996efa5064c01775d5aff003d9377
```

**Payload:**
```json
{
  "variables": {
    "post": {
      "allowedCommentersScope": "ALL",
      "intendedShareLifeCycleState": "PUBLISHED",
      "origin": "FEED",
      "visibilityDataUnion": {
        "visibilityType": "ANYONE"
      },
      "commentary": {
        "text": "Texto do post",
        "attributesV2": []
      }
    }
  },
  "queryId": "voyagerContentcreationDashShares.279996efa5064c01775d5aff003d9377",
  "includeWebMetadata": true
}
```

### 2. Backend API (`linkedin-job-backend`)
API REST que o frontend chama para criar posts.

**Localização:** `apps/linkedin-job-backend/src/routes/posts.ts`

## Rotas Disponíveis

### POST /api/posts
Cria um novo post no LinkedIn.

**Request:**
```typescript
POST /api/posts
Content-Type: application/json

{
  "text": "Conteúdo do post aqui"
}
```

**Response (Sucesso):**
```typescript
{
  "success": true,
  "postId": "7473558402925981696",
  "message": "Post criado com sucesso no LinkedIn!"
}
```

**Response (Erro):**
```typescript
{
  "success": false,
  "error": "Mensagem de erro"
}
```

**Status Codes:**
- `200` - Post criado com sucesso
- `400` - Texto vazio ou erro ao criar post
- `401` - Credenciais ausentes ou expiradas

## Como Usar no Frontend

### 1. Criar Serviço de Posts

Crie um arquivo `apps/linkedin-job-frontend/src/services/postsService.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface CreatePostResponse {
  success: boolean;
  postId?: string;
  message?: string;
  error?: string;
}

export const postsService = {
  async createPost(text: string): Promise<CreatePostResponse> {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar post');
    }

    return response.json();
  },
};
```

### 2. Criar Store (Zustand)

Crie um arquivo `apps/linkedin-job-frontend/src/stores/postsStore.ts`:

```typescript
import { create } from 'zustand';
import { postsService } from '../services/postsService';

interface PostsState {
  loading: boolean;
  error: string | null;
  lastPostId: string | null;
  
  createPost: (text: string) => Promise<void>;
  clearError: () => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  loading: false,
  error: null,
  lastPostId: null,

  createPost: async (text: string) => {
    set({ loading: true, error: null });
    try {
      const result = await postsService.createPost(text);
      if (result.success) {
        set({ lastPostId: result.postId || null, loading: false });
      } else {
        set({ error: result.error || 'Erro desconhecido', loading: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar post';
      set({ error: message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### 3. Criar Componente de UI

```typescript
import { useState } from 'react';
import { usePostsStore } from '../stores/postsStore';

export function CreatePostForm() {
  const [text, setText] = useState('');
  const { createPost, loading, error, lastPostId } = usePostsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await createPost(text);
    if (!error) {
      setText(''); // Limpar após sucesso
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="O que você quer compartilhar?"
        className="w-full p-3 border rounded-lg"
        rows={4}
        disabled={loading}
      />
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {lastPostId && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          Post criado com sucesso! ID: {lastPostId}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? 'Publicando...' : 'Publicar no LinkedIn'}
      </button>
    </form>
  );
}
```

## Requisitos

### Credenciais
O sistema requer credenciais válidas do LinkedIn (cookie e CSRF token) armazenadas no backend.

As credenciais são gerenciadas através do endpoint `/api/credentials` e devem ser sincronizadas via extensão do Chrome.

### Headers Importantes
O sistema captura automaticamente headers importantes do LinkedIn:
- `x-li-page-instance` - Identificador da página
- `x-li-track` - Dados de tracking
- `x-li-pem-metadata` - Metadados de permissão

Estes headers são salvos durante a sincronização de credenciais via extensão.

## Limitações Conhecidas

1. **Apenas texto simples** - A implementação atual suporta apenas posts de texto
2. **Visibilidade fixa** - Posts são sempre públicos (ANYONE)
3. **Sem mídia** - Não suporta upload de imagens, vídeos ou documentos
4. **Sem agendamento** - Posts são publicados imediatamente

## Próximas Funcionalidades (Para Implementar)

1. **Upload de imagens** - Adicionar suporte para anexar imagens ao post
2. **Upload de vídeos** - Suporte para vídeos
3. **Controle de visibilidade** - Permitir escolher quem pode ver (público, conexões, etc)
4. **Posts com poll** - Criar enquetes
5. **Editar posts** - Editar posts já publicados
6. **Deletar posts** - Remover posts
7. **Listar posts** - Buscar posts do feed
8. **Métricas** - Visualizações, curtidas, comentários

## Troubleshooting

### Erro 401 - Credenciais Ausentes
- Sincronize as credenciais usando a extensão do Chrome
- Verifique se o cookie `li_at` está presente

### Erro 400 - Falha ao Criar Post
- Verifique se o texto não está vazio
- Confirme que as credenciais estão válidas
- Verifique os logs do backend para mais detalhes

### Post criado mas `postId` retorna "unknown"
- O post foi criado com sucesso no LinkedIn
- A extração do ID do response pode ter falha
- Verifique os logs do serviço GraphQL para ver o response completo
