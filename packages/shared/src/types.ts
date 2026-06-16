export interface Job {
  id: string;
  title: string;
  companyInfo: string;
  companyLogo?: string;
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  url: string;
  employmentStatus: string;
  companyName: string;
  companyLogo?: string;
}

export interface FormQuestion {
  urn: string;
  required: boolean;
  title: string;
  type: string;
  options?: string[];
}

export interface ApplyForm {
  success: boolean;
  message?: string;
  steps?: Array<{
    title: string;
    questions: FormQuestion[];
  }>;
  questions?: FormQuestion[];
}

export interface Config {
  hasCredentials: boolean;
  hasImportedJobs: boolean;
}

export interface AIAnswer {
  urn: string;
  answer: string;
}

export interface AIResponse {
  answers: AIAnswer[];
}
