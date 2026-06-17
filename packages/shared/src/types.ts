export interface Job {
  id: string;
  title: string;
  companyInfo: string;
  companyLogo?: string;
  applied?: boolean;
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
  applyForm?: ApplyForm;
  applied?: boolean;
  appliedAt?: string;
  appliedOnLinkedIn?: boolean;
  viewedByJobPosterAt?: string | null;
  closed?: boolean;
}

export interface FormQuestion {
  urn: string;
  required: boolean;
  title: string;
  type: string;
  options?: string[];
  suggestedAnswer?: string;
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

export interface LinkedInResponse {
  included?: unknown[];
  [key: string]: unknown;
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  duration: string;
}

export interface ParsedResume {
  about: string;
  experiences: WorkExperience[];
  education: Education[];
}

export interface UserProfileResponse {
  profileId: string | null;
  name: string | null;
  headline: string | null;
  photoUrl: string | null;
  about: string | null;
  experiences: WorkExperience[];
  education: Education[];
  text: string;
  filename: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  status: string;
  answers?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  jobUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

