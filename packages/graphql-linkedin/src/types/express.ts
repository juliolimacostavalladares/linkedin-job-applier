import { Request } from 'express';

export interface LinkedInRequest extends Request {
  linkedinCredentials?: {
    cookie: string;
    csrf: string;
    headersJson?: string | null;
  };
}
