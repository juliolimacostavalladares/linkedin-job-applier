import { Response, NextFunction } from 'express';
import { LinkedInRequest } from '../types/express';
import { LinkedInService } from '../services/linkedinService';

export async function getProfileInfo(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const profileInfo = await svc.fetchProfileInfo();

    res.json(profileInfo);
  } catch (err) {
    next(err);
  }
}

export async function getResumePdf(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const { profileId } = req.query;

    if (!profileId || typeof profileId !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'profileId query parameter is required' });
      return;
    }

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const pdfBuffer = await svc.fetchResumePdf(profileId);
    
    const pdfParse = (await import('pdf-parse')).default;
    const nodeBuffer = Buffer.from(pdfBuffer);
    const parsed = await pdfParse(nodeBuffer);

    res.json({
      success: true,
      text: parsed.text,
      pdfBase64: nodeBuffer.toString('base64'),
    });
  } catch (err) {
    next(err);
  }
}
