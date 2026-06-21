import { getHeaders, handleResponseError } from '../http/linkedinHttpClient';
import { logger } from '../../utils/logger';

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Publishes a post to LinkedIn using the Voyager GraphQL API.
 * This uses the same endpoint that the LinkedIn web app uses internally.
 */
export async function createPost(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  text: string,
  mediaUrn?: string,
  mediaCategory?: string,
  documentSharingTitle?: string,
): Promise<CreatePostResult> {
  // LinkedIn's internal GraphQL endpoint for creating posts
  const apiUrl = 'https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=voyagerContentcreationDashShares.279996efa5064c01775d5aff003d9377';

  logger.info('Publishing post to LinkedIn via GraphQL', { textLength: text.length });

  const headers: Record<string, string> = {
    ...getHeaders(cookie, csrf, dynamicHeaders),
    'content-type': 'application/json; charset=UTF-8',
    'origin': 'https://www.linkedin.com',
    'referer': 'https://www.linkedin.com/feed/',
    'priority': 'u=1, i',
    'sec-ch-prefers-color-scheme': 'dark',
    'x-restli-protocol-version': '2.0.0',
    'x-li-pem-metadata': dynamicHeaders['x-li-pem-metadata'] || 'Voyager - Sharing - CreateShare=sharing-create-content',
  };

  // Add optional tracking headers if they exist in dynamicHeaders
  if (dynamicHeaders['x-li-page-instance']) {
    headers['x-li-page-instance'] = dynamicHeaders['x-li-page-instance'];
  }
  if (dynamicHeaders['x-li-track']) {
    headers['x-li-track'] = dynamicHeaders['x-li-track'];
  }

  // Determine media category and payload format based on URN type
  let mediaPayload = null;
  if (mediaUrn) {
    const isArticle = mediaUrn.startsWith('urn:li:article:');
    if (mediaCategory === 'DOCUMENT') {
      mediaPayload = {
        category: 'NATIVE_DOCUMENT',
        mediaUrn: mediaUrn,
        title: documentSharingTitle || 'Documento',
        recipes: [
          'urn:li:digitalmediaRecipe:feedshare-document-preview',
          'urn:li:digitalmediaRecipe:feedshare-document'
        ],
      };
    } else {
      mediaPayload = {
        category: isArticle ? 'URN_REFERENCE' : 'IMAGE',
        mediaUrn: mediaUrn,
        ...(isArticle 
          ? { originalUrl: null } 
          : { tapTargets: [], altText: '' }
        ),
      };
    }
  }

  // Build the GraphQL payload matching LinkedIn's internal API format
  const payload = {
    variables: {
      post: {
        allowedCommentersScope: 'ALL',
        intendedShareLifeCycleState: 'PUBLISHED',
        origin: 'FEED',
        visibilityDataUnion: {
          visibilityType: 'ANYONE',
        },
        commentary: {
          text: text,
          attributesV2: [],
        },
        ...(mediaPayload && { media: mediaPayload }),
      },
    },
    queryId: 'voyagerContentcreationDashShares.279996efa5064c01775d5aff003d9377',
    includeWebMetadata: true,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      redirect: 'manual',
    });

    handleResponseError(response);

    const responseData = await response.json() as {
      data?: {
        createContentcreationDashShares?: {
          resourceKey?: string;
        };
      };
      included?: Array<{
        entityUrn?: string;
        $type?: string;
      }>;
    };

    let postId = '';

    // Extract post ID from the GraphQL response
    // The response contains the share URN in the data.createContentcreationDashShares.resourceKey
    if (responseData.data?.createContentcreationDashShares?.resourceKey) {
      const resourceKey = responseData.data.createContentcreationDashShares.resourceKey;
      // Extract the ID from URN format: "urn:li:fsd_share:urn:li:share:7473558402925981696"
      const match = resourceKey.match(/:share:(\d+)/);
      if (match && match[1]) {
        postId = match[1];
      }
    }

    // Fallback: try to find it in the included entities
    if (!postId && responseData.included) {
      for (const entity of responseData.included) {
        if (entity.$type === 'com.linkedin.voyager.dash.contentcreation.Share' && entity.entityUrn) {
          const match = entity.entityUrn.match(/:share:(\d+)/);
          if (match && match[1]) {
            postId = match[1];
            break;
          }
        }
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

export interface DeletePostResult {
  success: boolean;
  error?: string;
}

/**
 * Deletes a post from LinkedIn using the Voyager GraphQL API.
 */
export async function deletePost(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string>,
  linkedinId: string,
): Promise<DeletePostResult> {
  const apiUrl = 'https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=voyagerContentcreationDashShares.c459f081c61de601a90d103fbea46496';

  logger.info('Deleting post from LinkedIn via GraphQL', { linkedinId });

  const headers: Record<string, string> = {
    ...getHeaders(cookie, csrf, dynamicHeaders),
    'content-type': 'application/json; charset=UTF-8',
    'origin': 'https://www.linkedin.com',
    'referer': 'https://www.linkedin.com/feed/',
    'x-li-pem-metadata': 'Voyager - Sharing - DeleteShare=sharing-delete-content',
  };

  const payload = {
    variables: {
      updateUrn: `urn:li:fsd_update:(urn:li:activity:${linkedinId},MEMBER_SHARES,DEBUG_REASON,DEFAULT,false)`,
    },
    queryId: 'voyagerContentcreationDashShares.c459f081c61de601a90d103fbea46496',
    includeWebMetadata: true,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      redirect: 'manual',
    });

    handleResponseError(response);

    const responseData = await response.json();
    logger.info('Post deleted successfully from LinkedIn', { linkedinId, responseData });
    return {
      success: true,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error deleting post from LinkedIn:', { error });
    return {
      success: false,
      error: errMsg,
    };
  }
}
