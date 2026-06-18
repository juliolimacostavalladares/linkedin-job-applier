import { getHeaders, handleResponseError } from '../http/linkedinHttpClient';
import { logger } from '../../utils/logger';

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Publishes a post to LinkedIn using the Voyager content/shares API.
 */
export async function createPost(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  text: string,
): Promise<CreatePostResult> {
  const apiUrl = 'https://www.linkedin.com/voyager/api/content/shares';
  logger.info('Publishing post to LinkedIn', { textLength: text.length });

  const headers: Record<string, string> = {
    ...getHeaders(cookie, csrf, dynamicHeaders),
    'content-type': 'application/json; charset=UTF-8',
    'origin': 'https://www.linkedin.com',
    'referer': 'https://www.linkedin.com/feed/',
  };

  const payload = {
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      target: 'FEED',
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      redirect: 'manual',
    });

    handleResponseError(response);

    const textResponse = await response.text();
    let postId = '';

    if (textResponse) {
      try {
        const json = JSON.parse(textResponse) as Record<string, unknown>;
        // Try to extract created share URN or entity Urn if present
        if (json.urn && typeof json.urn === 'string') {
          postId = json.urn.split(':').pop() ?? '';
        } else if (json.id && typeof json.id === 'string') {
          postId = json.id.split(':').pop() ?? '';
        }
      } catch {
        // Response wasn't JSON or parsing failed, but HTTP was ok (200/201)
      }
    }

    logger.info('Post published successfully on LinkedIn', { postId });
    return {
      success: true,
      postId: postId || 'unknown',
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error publishing post to LinkedIn:', { error });
    return {
      success: false,
      error: errMsg,
    };
  }
}
