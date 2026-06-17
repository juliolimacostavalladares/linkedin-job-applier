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
  /** For entity/typeahead fields: the URN of each option (parallel array with options[]) */
  optionUrns?: string[];
  /** For multipleChoice fields without a URN: the raw enum string for each option */
  optionEnumStrings?: string[];
  suggestedAnswer?: string;
}

// ─── LinkedIn REST Submission Types ──────────────────────────────────────────

export interface EntityInputValue {
  inputEntityName: string;
  inputEntityUrn?: string;
  optionEnumString?: string;
}

export interface DateBoundary {
  year: number;
  month: number;
  day: number;
}

export interface DateRangeInputValue {
  start: DateBoundary;
  end: DateBoundary;
}

/** Discriminated union matching LinkedIn's `formElementInputValues` wire format */
export type FormElementInputValue =
  | { textInputValue: string }
  | { entityInputValue: EntityInputValue }
  | { dateRangeInputValue: DateRangeInputValue };

export interface FormResponse {
  formElementUrn: string;
  formElementInputValues: FormElementInputValue[];
}

export interface FileUploadResponse {
  /** URN of the uploaded resume (e.g. "urn:li:fsd_resume:/...") */
  inputUrn: string;
  /** The form element URN for the file upload field */
  formElementUrn: string;
}

export interface ApplyForm {
  success: boolean;
  message?: string;
  steps?: Array<{
    title: string;
    questions: FormQuestion[];
  }>;
  questions?: FormQuestion[];
  /**
   * Client-generated base64(16 bytes) token.
   * Created fresh at parse time and forwarded verbatim in the POST submitApplication body.
   */
  referenceId?: string;
  /**
   * The form element URN for the resume/CV file upload field.
   * Used to build the fileUploadResponses in the submit payload.
   */
  resumeUploadFormElementUrn?: string;
  /**
   * All available resume URNs (entityUrn of Resume items), sorted by lastUsedAt desc.
   * Use the first one as the preferred resume for this application.
   */
  resumeUrns?: string[];
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

