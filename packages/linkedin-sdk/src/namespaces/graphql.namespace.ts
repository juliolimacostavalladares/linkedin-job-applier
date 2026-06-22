import axios from 'axios';
import type { LinkedInSDKConfig } from '../index';

export class GraphQLNamespace {
  constructor(private config: LinkedInSDKConfig) {}

  async execute<TData = any, TVariables = Record<string, any>>(
    query: string,
    variables?: TVariables
  ): Promise<{ data?: TData; errors?: any[] }> {
    if (this.config.mode === 'direct') {
      try {
        const { graphql } = await import('graphql');
        const { executableSchema } = await import('@linkedin-job-applier/graphql-linkedin');
        
        const result = await graphql({
          schema: executableSchema,
          source: query,
          variableValues: variables as unknown as Record<string, unknown>,
          contextValue: {
            credentials: this.config.linkedinCredentials
          }
        });
        return result as { data?: TData; errors?: any[] };
      } catch (err: any) {
        throw new Error(
          `Os pacotes 'graphql' e '@linkedin-job-applier/graphql-linkedin' são necessários no modo direto: ${err.message}`
        );
      }
    } else {
      const { data } = await axios.post(`${this.config.baseUrl}/graphql`, {
        query,
        variables
      });
      return data;
    }
  }
}
