# Especificação Técnica de Arquitetura: `@linkedin-job-applier/linkedin-sdk`

Esta especificação foi criada seguindo rigorosamente as diretrizes da skill **`sdk-architect`** para a extração da lógica central das aplicações do LinkedIn do monorepo e unificação sob uma única **SDK TypeScript limpa, desacoplada de tecnologias de banco/LLM proprietárias e altamente configurável**.

---

## 1. 🔍 Auditoria de Desacoplamento (Decoupling Strategy)

Para evitar dependências rígidas e acoplamento a tecnologias proprietárias ou infraestruturas locais de banco de dados, estabelecemos três pilares de desacoplamento no SDK:

### A. Desacoplamento do Banco de Dados (Database Agnostic)
- **O Problema**: A lógica interna de vagas dependia diretamente do Prisma Client e do banco SQLite (`shared.db`).
- **A Solução**: Implementamos o **Pattern Adapter de Repositório (Storage Adapter)**. O SDK não gerencia conexões SQL brutas ou Prisma diretamente. Em vez disso, ele define a interface estrita `LinkedInSDKStorage`. O consumidor do SDK fornece qualquer driver de banco que desejar (Prisma, PostgreSQL nativo, Drizzle, etc.).

### B. Desacoplamento de Inteligência Artificial (OpenAI-Compatible AI Client)
- **O Problema**: O serviço de IA estava acoplado à API proprietária da `9Router`.
- **A Solução**: Reformulamos o módulo de inteligência artificial para se conectar a qualquer endpoint compatível com o protocolo aberto de **Chat Completions da OpenAI** (`/v1/chat/completions`). Isso possibilita integrar o SDK com:
  - OpenAI Oficial (GPT-4o, GPT-3.5)
  - Ollama Local (LLaMA 3, Mistral, DeepSeek)
  - Gateways de API alternativos (9Router, OpenRouter, Groq, local LM Studio)

### C. Isolamento da GraphQL Gateway API
- **A Lógica Interna Mantida**: Mantemos a integração com a GraphQL API do LinkedIn Gateway, pois ela é a interface especializada do monorepo que interage diretamente com as rotas Voyager do LinkedIn para buscar dados de vagas e perfis.

---

## 2. 📂 Estrutura de Arquivos Proposta (`packages/linkedin-sdk`)

```text
packages/linkedin-sdk/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── src/
    ├── index.ts                <-- Ponto de entrada (Fachada LinkedInSDK)
    ├── errors.ts               <-- SDKError e classes filhas de erro
    ├── types.ts                <-- Interfaces e tipos (Storage, AI, etc.)
    ├── namespaces/
    │   ├── jobs.namespace.ts   <-- API de candidatura e currículos (Agrupado por Storage e AI)
    │   ├── publisher.ns.ts     <-- Geração de PDF e posts de mídias
    │   └── graphql.ns.ts       <-- Executor de chamadas GraphQL
    └── utils/
        └── http.ts             <-- Utilitário HTTP isolado e reutilizável
```

---

## ⚙️ Configurações e Tipagens Desacopladas

### A. Tipos de Interfaces de Armazenamento e IA (`src/types.ts`)

```typescript
// packages/linkedin-sdk/src/types.ts

// ─── Interfaces de Armazenamento (Database Agnostic) ──────────────────────────

export interface Resume {
  id: string;
  profileId: string | null;
  name: string | null;
  headline: string | null;
  photoUrl: string | null;
  text: string;
  filename: string | null;
  about: string | null;
  experienceJson: string | null;
  educationJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  status: string;
  answers: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  jobUrl?: string | null;
  optimizedResume?: string | null;
  resumePdfPath?: string | null;
  resumePdfBase64?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationMetadata {
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  jobUrl?: string;
  optimizedResume?: string;
  resumePdfPath?: string;
  resumePdfBase64?: string;
}

/**
 * Interface que qualquer banco SQL/NoSQL do usuário deve implementar
 * para rodar no modo direto 'direct' do SDK.
 */
export interface LinkedInSDKStorage {
  getResume(profileId: string): Promise<Resume | null>;
  getLatestResume(): Promise<Resume | null>;
  upsertResume(profileId: string | null, data: Partial<Resume>): Promise<Resume>;
  
  saveApplication(
    jobId: string,
    answers: string,
    status: string,
    metadata?: ApplicationMetadata
  ): Promise<Application>;
  listApplications(): Promise<Application[]>;
  getApplicationByJobId(jobId: string): Promise<Application | null>;
  updateApplicationStatus(jobId: string, status: string): Promise<Application | null>;
}

// ─── Interfaces de IA (OpenAI Protocol Compatible) ─────────────────────────────

export interface AIConfig {
  /** URL base do chat completion (ex: 'https://api.openai.com/v1' ou 'http://localhost:11434/v1') */
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export interface FormQuestion {
  urn: string;
  required: boolean;
  title: string;
  type: string;
  options?: string[];
  optionUrns?: string[];
  optionEnumStrings?: string[];
  suggestedAnswer?: string;
  prefilledValue?: string;
}

export interface AIAnswer {
  urn: string;
  answer: string;
}

export interface AIResponse {
  answers: AIAnswer[];
}

export interface ParsedResume {
  about: string;
  experiences: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
  }>;
}
```

---

## 🛠️ Implementação da SDK e Namespaces Desacoplados

### A. Classe Construtora Principal (`src/index.ts`)

```typescript
// packages/linkedin-sdk/src/index.ts

import { JobsNamespace } from './namespaces/jobs.namespace';
import { PublisherNamespace } from './namespaces/publisher.ns';
import { GraphQLNamespace } from './namespaces/graphql.ns';
import { SDKValidationError } from './errors';
import type { LinkedInSDKStorage, AIConfig } from './types';

export * from './errors';
export * from './types';

export interface LinkedInSDKConfig {
  mode: 'direct' | 'http';
  
  /** URL base para requisições no modo HTTP */
  baseUrl?: string;

  /** Credenciais de autenticação do LinkedIn Voyager */
  linkedinCredentials?: {
    cookie: string;
    csrf: string;
  };

  /** Configuração para IA (OpenAI Protocol) */
  ai?: AIConfig;

  /** Instância do adaptador de banco implementado pelo usuário */
  storage?: LinkedInSDKStorage;
}

export class LinkedInSDK {
  public readonly jobs: JobsNamespace;
  public readonly publisher: PublisherNamespace;
  public readonly graphql: GraphQLNamespace;
  private readonly config: LinkedInSDKConfig;

  constructor(config: LinkedInSDKConfig) {
    this.validateConfig(config);
    this.config = config;

    this.jobs = new JobsNamespace(config);
    this.publisher = new PublisherNamespace(config);
    this.graphql = new GraphQLNamespace(config);
  }

  private validateConfig(config: LinkedInSDKConfig): void {
    if (!config.mode) {
      throw new SDKValidationError("O parâmetro 'mode' é obrigatório.");
    }
    if (config.mode === 'http' && !config.baseUrl) {
      throw new SDKValidationError("A propriedade 'baseUrl' é obrigatória ao utilizar o modo HTTP.");
    }
    if (config.mode === 'direct' && !config.storage) {
      throw new SDKValidationError("Um storage adapter ('storage') válido é obrigatório no modo 'direct'.");
    }
  }

  public getConfig(): LinkedInSDKConfig {
    return { ...this.config };
  }
}
```

### B. Namespace de Vagas com Injeção de Dependências (`src/namespaces/jobs.namespace.ts`)

O namespace recebe o storage injetado e o AI Config genérico, mantendo o SDK limpo de bibliotecas pesadas de banco.

```typescript
// packages/linkedin-sdk/src/namespaces/jobs.namespace.ts

import axios from 'axios';
import type { LinkedInSDKConfig } from '../index';
import type { FormQuestion, AIResponse } from '../types';
import { SDKValidationError, SDKExecutionError } from '../errors';

export class JobsNamespace {
  constructor(private config: LinkedInSDKConfig) {}

  /**
   * Envia as perguntas de um formulário de candidatura para o LLM configurado.
   * Totalmente compatível com OpenAI-protocol.
   */
  async generateAnswers(questions: FormQuestion[], resumeText: string): Promise<AIResponse> {
    if (!this.config.ai) {
      throw new SDKValidationError("Configuração de IA ('ai') não foi fornecida nas opções do SDK.");
    }

    const { baseUrl, apiKey, model } = this.config.ai;
    const prompt = `Dadas as perguntas de candidatura e o currículo do usuário, sugira as respostas apropriadas no formato JSON solicitado.
    
    Perguntas: ${JSON.stringify(questions)}
    Currículo: ${resumeText}`;

    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
          }
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new SDKExecutionError("Resposta vazia retornada pelo LLM.");
      }

      return JSON.parse(content) as AIResponse;
    } catch (error: any) {
      throw new SDKExecutionError(`Erro de comunicação com o LLM: ${error.message}`);
    }
  }

  /**
   * Salva e processa a candidatura utilizando o Storage Adapter fornecido.
   */
  async apply(jobId: string, answers: Record<string, string>) {
    if (this.config.mode === 'direct') {
      const storage = this.config.storage!;
      const answersStr = JSON.stringify(answers);
      
      // Persiste no banco de dados customizado do usuário sem acoplamento de ORM
      return await storage.saveApplication(jobId, answersStr, 'applied');
    } else {
      const { data } = await axios.post(`${this.config.baseUrl}/api/jobs/apply`, {
        jobId,
        answers,
        credentials: this.config.linkedinCredentials
      });
      return data;
    }
  }
}
```

---

## 🚀 Como o Consumidor Implementa seu próprio Banco (Exemplo Prisma SQL)

Se o usuário final de sua biblioteca utiliza Prisma e SQL, ele simplesmente cria uma classe adaptadora e a passa para o SDK:

```typescript
import { PrismaClient } from '@prisma/client';
import { LinkedInSDK, LinkedInSDKStorage } from '@linkedin-job-applier/linkedin-sdk';

const prisma = new PrismaClient();

// Implementação do Storage Adapter customizado
class MeuBancoSQLAdapter implements LinkedInSDKStorage {
  async getResume(profileId: string) {
    return await prisma.resume.findUnique({ where: { profileId } });
  }

  async getLatestResume() {
    return await prisma.resume.findFirst({ orderBy: { updatedAt: 'desc' } });
  }

  async upsertResume(profileId: string | null, data: any) {
    // Implementação do upsert com SQL/Prisma
    return await prisma.resume.upsert({
      where: { profileId: profileId || '' },
      update: data,
      create: { profileId, ...data }
    });
  }

  async saveApplication(jobId: string, answers: string, status: string, metadata?: any) {
    return await prisma.application.create({
      data: { jobId, answers, status, ...metadata }
    });
  }

  async listApplications() {
    return await prisma.application.findMany();
  }

  async getApplicationByJobId(jobId: string) {
    return await prisma.application.findFirst({ where: { jobId } });
  }

  async updateApplicationStatus(jobId: string, status: string) {
    const app = await prisma.application.findFirst({ where: { jobId } });
    if (!app) return null;
    return await prisma.application.update({
      where: { id: app.id },
      data: { status }
    });
  }
}

// Inicializando a SDK totalmente desacoplada!
const sdk = new LinkedInSDK({
  mode: 'direct',
  storage: new MeuBancoSQLAdapter(), // Banco desacoplado!
  ai: {
    baseUrl: 'http://localhost:11434/v1', // Ollama Local com LLaMA 3!
    model: 'llama3',
  },
  linkedinCredentials: {
    cookie: 'li_at=...',
    csrf: 'ajax:...'
  }
});
```
