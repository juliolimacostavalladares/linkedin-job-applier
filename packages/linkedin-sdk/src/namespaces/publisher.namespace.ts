import axios from 'axios';
import type { LinkedInSDKConfig } from '../index';

export class PublisherNamespace {
  constructor(private config: LinkedInSDKConfig) {}

  async createPost(
    text: string,
    options?: {
      mediaUrn?: string;
      mediaCategory?: string;
      documentSharingTitle?: string;
    }
  ) {
    if (this.config.mode === 'direct') {
      try {
        const { graphql } = await import('graphql');
        const { executableSchema } = await import('@linkedin-job-applier/graphql-linkedin');
        
        const credentials = this.config.linkedinCredentials;
        if (!credentials) {
          throw new Error("Credenciais do LinkedIn são necessárias para publicação direta.");
        }

        const query = `
          mutation PublishPost($cookie: String!, $csrf: String!, $text: String!, $mediaUrn: String, $mediaCategory: String, $documentSharingTitle: String) {
            createPost(cookie: $cookie, csrf: $csrf, text: $text, mediaUrn: $mediaUrn, mediaCategory: $mediaCategory, documentSharingTitle: $documentSharingTitle) {
              success
              postId
              error
            }
          }
        `;

        const result = await graphql({
          schema: executableSchema,
          source: query,
          variableValues: {
            cookie: credentials.cookie,
            csrf: credentials.csrf,
            text,
            mediaUrn: options?.mediaUrn,
            mediaCategory: options?.mediaCategory,
            documentSharingTitle: options?.documentSharingTitle,
          }
        });

        if (result.errors && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }

        return (result.data as any)?.createPost;
      } catch (err: any) {
        throw new Error(`Erro ao publicar post localmente: ${err.message}`);
      }
    } else {
      const { data } = await axios.post(`${this.config.baseUrl}/api/publisher/posts`, {
        text,
        mediaUrn: options?.mediaUrn,
        mediaCategory: options?.mediaCategory,
        documentSharingTitle: options?.documentSharingTitle,
      });
      return data;
    }
  }
}
