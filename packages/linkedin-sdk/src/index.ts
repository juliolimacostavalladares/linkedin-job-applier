import { JobsNamespace } from './namespaces/jobs.namespace';
import { PublisherNamespace } from './namespaces/publisher.namespace';
import { GraphQLNamespace } from './namespaces/graphql.namespace';
import { SDKValidationError } from './errors';
import type { LinkedInSDKStorage, AIConfig } from './types';

export * from './errors';
export * from './types';

export interface LinkedInSDKConfig {
  /**
   * Modo de consumo da SDK:
   * - 'direct': Executa lógica de serviços localmente via banco customizado do usuário (Server-side/Workers).
   * - 'http': Faz requisições HTTP para os microsserviços rodando na rede (Browser/Client-side).
   */
  mode: 'direct' | 'http';
  
  /**
   * URL base da API Gateway (obrigatória para o modo HTTP).
   */
  baseUrl?: string;

  /**
   * Credenciais globais do LinkedIn para execução direta in-process.
   */
  linkedinCredentials?: {
    cookie: string;
    csrf: string;
  };

  /**
   * Configuração para IA (OpenAI Protocol).
   */
  ai?: AIConfig;

  /**
   * Instância do adaptador de banco de dados do usuário (obrigatório para direct mode).
   */
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
      throw new SDKValidationError("O campo 'mode' é obrigatório (deve ser 'direct' ou 'http').");
    }
    
    if (config.mode === 'http' && !config.baseUrl) {
      throw new SDKValidationError("A propriedade 'baseUrl' é obrigatória ao utilizar o modo 'http'.");
    }

    if (config.mode === 'direct' && !config.storage) {
      throw new SDKValidationError("Um storage adapter ('storage') válido é obrigatório no modo 'direct'.");
    }
  }

  /**
   * Retorna a configuração ativa do SDK.
   */
  public getConfig(): LinkedInSDKConfig {
    return { ...this.config };
  }
}
