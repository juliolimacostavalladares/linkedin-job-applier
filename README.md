<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# LinkedIn Job Applier

Monorepo para aplicação de vagas no LinkedIn com extensão do Chrome e servidor backend.

## Estrutura

```
linkedin-job-applier/
├── apps/
│   ├── web/          # Aplicação React + Express
│   └── extension/    # Extensão do Chrome
└── packages/
    └── shared/       # Código compartilhado (tipos, utilitários)
```

## Setup

### Pré-requisitos
- Node.js 18+
- pnpm

### Instalação

```bash
# Instalar pnpm (se necessário)
npm install -g pnpm

# Instalar dependências
pnpm install
```

## Scripts

```bash
# Desenvolvimento (todos os pacotes)
pnpm dev

# Build (todos os pacotes)
pnpm build

# Iniciar servidor
pnpm start

# Limpar builds
pnpm clean

# Verificar tipos
pnpm lint
```

## Apps

### Web (`apps/web`)
Aplicação React com servidor Express para processar vagas do LinkedIn.

```bash
cd apps/web
pnpm dev    # Inicia servidor de desenvolvimento na porta 3000
pnpm build  # Build de produção
```

### Extension (`apps/extension`)
Extensão do Chrome para sincronizar vagas do LinkedIn.

Carregue a pasta `apps/extension` como extensão não empacotada no Chrome:
1. Acesse `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `apps/extension`

## Packages

### Shared (`packages/shared`)
Tipos e utilitários compartilhados entre os apps.

```typescript
import { Job, ApiConfig } from '@linkedin-job-applier/shared';
```

## Configuração

Copie `.env.example` para `.env` em `apps/web` e configure:

```bash
LINKEDIN_COOKIE=seu-cookie
LINKEDIN_CSRF=seu-csrf
```

## Licença

MIT
