import { Response, NextFunction } from 'express';
import { LinkedInRequest } from '../types/express';
import { LinkedInService } from '../services/linkedinService';

export async function getJobs(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const { keywords, remote, past24h } = req.query;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const jobs = await svc.fetchJobs(
      typeof keywords === 'string' ? keywords : null,
      remote === 'true',
      past24h === 'true'
    );

    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function getJobDetail(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const jobId = req.params.id;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const jobDetail = await svc.fetchJobDetail(jobId);

    res.json(jobDetail);
  } catch (err) {
    next(err);
  }
}

export async function getApplyForm(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const jobId = req.params.id;

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);
    const applyForm = await svc.fetchApplyForm(jobId);

    res.json(applyForm);
  } catch (err) {
    next(err);
  }
}

export async function submitApplication(req: LinkedInRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const creds = req.linkedinCredentials!;
    const jobId = req.params.id;
    const {
      formValues,
      formResponses,
      referenceId,
      fileUploadResponses,
      resumeUrn,
      resumeUploadFormElementUrn,
    } = req.body;

    if (!formValues || typeof formValues !== 'object') {
      res.status(400).json({ error: 'Bad Request', message: 'formValues object is required' });
      return;
    }

    const svc = new LinkedInService(creds.cookie, creds.csrf, creds.headersJson);

    let finalFileUploads = fileUploadResponses;
    if (!finalFileUploads && resumeUrn && resumeUploadFormElementUrn) {
      finalFileUploads = [{
        inputUrn: resumeUrn,
        formElementUrn: resumeUploadFormElementUrn,
      }];
    }

    const result = await svc.submitApplyForm(jobId, formValues, {
      formResponses,
      referenceId,
      fileUploadResponses: finalFileUploads,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

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
