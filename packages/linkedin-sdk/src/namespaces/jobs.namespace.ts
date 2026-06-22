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
    const prompt = `Dadas as perguntas de candidatura e o currículo do usuário, sugira as respostas apropriadas no formato JSON solicitado contendo as respostas.
    
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
   * Salva e processa a candidatura utilizando o Storage Adapter fornecido ou chamada remota.
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
