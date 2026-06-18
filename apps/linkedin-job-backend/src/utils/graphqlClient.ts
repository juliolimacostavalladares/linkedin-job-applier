import { config } from '../config';
import { logger } from './logger';

export async function queryGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  logger.debug('Sending GraphQL request', {
    url: config.services.linkedinGraphQLUrl,
    variables
  });

  const response = await fetch(config.services.linkedinGraphQLUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL Service HTTP Error: ${response.statusText}`);
  }

  const result = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL Error: ${result.errors[0].message}`);
  }

  if (!result.data) {
    throw new Error('GraphQL returned no data');
  }

  return result.data;
}
