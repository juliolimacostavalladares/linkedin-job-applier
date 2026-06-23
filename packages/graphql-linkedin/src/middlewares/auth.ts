import { Response, NextFunction } from 'express';
import { LinkedInRequest } from '../types/express';
import { validateCredentials } from '../utils/security';
import { logger } from '../utils/logger';

export function linkedinAuthMiddleware(
  req: LinkedInRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const cookie =
      (req.headers['x-linkedin-cookie'] as string) ||
      (req.headers['cookie'] as string) ||
      '';
    
    const csrf =
      (req.headers['x-linkedin-csrf'] as string) ||
      (req.headers['x-csrf-token'] as string) ||
      (req.headers['csrf-token'] as string) ||
      '';

    const headersJson =
      (req.headers['x-linkedin-headers-json'] as string) ||
      (req.headers['x-headers-json'] as string) ||
      null;

    validateCredentials(cookie, csrf);

    req.linkedinCredentials = {
      cookie,
      csrf,
      headersJson,
    };

    next();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.warn('Authentication middleware validation failed', { error: errMsg });
    res.status(401).json({
      error: 'Unauthorized',
      message: errMsg,
    });
  }
}
