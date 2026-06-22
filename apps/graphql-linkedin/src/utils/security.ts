import { logger } from './logger';

export function validateCredentials(cookie: string, csrf: string): void {
  if (!cookie || typeof cookie !== 'string' || cookie.trim().length < 10) {
    throw new Error('Invalid cookie: must be a non-empty string of reasonable length');
  }
  if (!csrf || typeof csrf !== 'string' || csrf.trim().length < 4) {
    throw new Error('Invalid CSRF token: must be a non-empty string');
  }

  const cleanCookie = cookie.toLowerCase();
  const hasLiAt = cleanCookie.includes('li_at=');
  const hasJsessionId = cleanCookie.includes('jsessionid=');

  if (!hasLiAt || !hasJsessionId) {
    logger.warn('Cookie warning: missing typical session identifiers (li_at or JSESSIONID)');
  }
}

export function validateHeadersJson(headersJson?: string | null): Record<string, string> {
  if (!headersJson) return {};
  try {
    const parsed = JSON.parse(headersJson) as Record<string, unknown>;
    const validated: Record<string, string> = {};

    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === 'string') {
        const safeKey = key.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        if (safeKey) {
          validated[safeKey] = val;
        }
      }
    }
    return validated;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Failed to parse and validate headers JSON', { error: errorMsg });
    return {};
  }
}

export function redactSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const obj = data as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};

  const sensitiveKeys = ['cookie', 'csrf', 'x-linkedin-cookie', 'x-linkedin-csrf', 'csrf-token', 'headersjson'];

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.includes(lowerKey)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else if (typeof value === 'string' && (value.includes('li_at=') || value.includes('JSESSIONID='))) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}
