import { Response, NextFunction } from 'express';
import { LinkedInRequest } from '../types/express';
import { LinkedInService } from '../services/linkedinService';

export async function createPost(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const { text, mediaUrn, mediaCategory, documentSharingTitle } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'text field is required and must be a string' });
      return;
    }

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const result = await svc.createPost(
      text,
      mediaUrn,
      mediaCategory,
      documentSharingTitle
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const postId = req.params.id;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const result = await svc.deletePost(postId);

    res.json(result);
  } catch (err) {
    next(err);
  }
}
