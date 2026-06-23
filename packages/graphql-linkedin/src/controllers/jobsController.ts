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
