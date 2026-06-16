# LinkedIn Job Applier

Monorepo para aplicação de vagas no LinkedIn com extensão do Chrome, frontend React e servidor backend integrado via Turborepo e PNPM.

## Estrutura

```
linkedin-job-applier/
├── apps/
│   ├── backend/          # Servidor Express, Prisma ORM (SQLite) e Gateway
│   ├── frontend/         # Aplicação React + Vite + Tailwind CSS + Zustand
│   ├── graphql-linkedin/ # Microsserviço GraphQL para gerenciar chamadas ao LinkedIn
│   └── extension/        # Extensão do Chrome para captura segura de credenciais
└── packages/
    └── shared/           # Tipos TypeScript e utilitários compartilhados
```

## Setup

### Pré-requisitos
- Node.js 18+
- pnpm (instalador de pacotes global)

### Instalação

```bash
# Instalar pnpm (se necessário)
npm install -g pnpm

# Instalar dependências no workspace root
pnpm install
```

## Scripts

No diretório raiz do monorepo, você pode rodar os seguintes comandos através do Turborepo:

```bash
# Desenvolvimento (inicia backend e frontend em paralelo)
pnpm dev

# Build (compila todos os pacotes e apps em paralelo)
pnpm build

# Iniciar servidor backend em produção
pnpm start

# Limpar arquivos de build
pnpm clean

# Verificar tipos de todos os projetos (TypeScript checks)
pnpm lint
```

## Apps e Pacotes

### Backend (`apps/backend`)
Servidor Express encarregado de interagir com o LinkedIn (buscar vagas, detalhes do formulário de candidatura simplificada) e com o Gemini para gerar respostas.

```bash
cd apps/backend
pnpm dev    # Inicia em modo de desenvolvimento (porta 3000)
pnpm build  # Compila para produção
```

### GraphQL LinkedIn (`apps/graphql-linkedin`)
Serviço GraphQL isolado responsável por gerenciar toda a interação de baixo nível com as APIs do LinkedIn (buscar vagas, parsear formulários, extrair PDF de currículo).

```bash
cd apps/graphql-linkedin
pnpm dev    # Inicia em modo de desenvolvimento (porta 4000)
pnpm build  # Compila para produção
```

### Frontend (`apps/frontend`)
Interface moderna em React e Tailwind CSS onde você visualiza as vagas e inicia o auto-preenchimento por Inteligência Artificial.

```bash
cd apps/frontend
pnpm dev    # Inicia o servidor Vite
pnpm build  # Gera build estático em dist/
```

### Extension (`apps/extension`)
Extensão de Chrome cuja única responsabilidade é extrair com segurança os cookies de sessão (`li_at` e `JSESSIONID`) do LinkedIn e enviá-los ao servidor local.

Para instalar no Chrome:
1. Acesse `chrome://extensions/`
2. Ative o **Modo do desenvolvedor** no canto superior direito.
3. Clique em **Carregar sem compactação** (Load unpacked).
4. Selecione a pasta `apps/extension`.

### Shared (`packages/shared`)
Contratos de dados e interfaces compartilhadas importados por todos os apps.

```typescript
import { Job, JobDetail, FormQuestion, AIAnswer } from '@linkedin-job-applier/shared';
```

## Configuração (Variáveis de Ambiente)

1. **Backend**: copie `apps/backend/.env.example` para `apps/backend/.env` e configure:
   ```env
   GEMINI_API_KEY=sua-chave-api-do-gemini
   LINKEDIN_SERVICE_URL=http://localhost:4000/graphql
   PORT=3000
   ```

2. **GraphQL LinkedIn**: copie `apps/graphql-linkedin/.env.example` para `apps/graphql-linkedin/.env` e configure:
   ```env
   PORT=4000
   ```

3. **Frontend**: copie `apps/frontend/.env.example` para `apps/frontend/.env` e configure:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## Licença

MIT

