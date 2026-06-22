import { logger } from '../../utils/logger';

/**
 * Builds the standard LinkedIn Voyager API request headers.
 * Dynamic headers (lowercased) are merged in last, so cookie/csrf are always authoritative.
 */
export function getHeaders(
  cookie: string,
  csrf: string,
  dynamicHeaders: Record<string, string> = {},
): Record<string, string> {
  const baseHeaders: Record<string, string> = {
    accept: 'application/vnd.linkedin.normalized+json+2.1',
    'csrf-token': csrf,
    cookie,
    'x-restli-protocol-version': '2.0.0',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
  };

  const cleanedDynamic: Record<string, string> = {};
  for (const key of Object.keys(dynamicHeaders)) {
    cleanedDynamic[key.toLowerCase()] = dynamicHeaders[key];
  }

  return {
    ...baseHeaders,
    ...cleanedDynamic,
    // Always override these two so they can't be clobbered by dynamic headers
    'csrf-token': csrf,
    cookie,
  };
}

/**
 * Throws a structured error when a LinkedIn API response is non-2xx.
 */
export function handleResponseError(response: Response): void {
  if (!response.ok) {
    const isRedirect = response.status >= 300 && response.status < 400;
    if (response.status === 401 || response.status === 403 || isRedirect) {
      throw {
        statusCode: isRedirect ? 401 : response.status,
        message: 'Acesso negado: O cookie ou token expirou',
      };
    }
    throw {
      statusCode: response.status,
      message: `Erro na API do LinkedIn: ${response.statusText}`,
    };
  }
}

/**
 * Parses the headersJson string (from the GraphQL resolver) into a plain object.
 * On parse failure, logs the error and returns an empty object.
 */
export function parseDynamicHeaders(headersJson?: string | null): Record<string, string> {
  if (!headersJson) return {};
  try {
    return JSON.parse(headersJson) as Record<string, string>;
  } catch (e) {
    logger.error('Error parsing dynamic headers JSON', e);
    return {};
  }
}
