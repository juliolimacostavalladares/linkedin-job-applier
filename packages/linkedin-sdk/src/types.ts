// ─── Interfaces de Armazenamento (Database Agnostic) ──────────────────────────

export interface Resume {
  id: string;
  profileId: string | null;
  name: string | null;
  headline: string | null;
  photoUrl: string | null;
  text: string;
  filename: string | null;
  about: string | null;
  experienceJson: string | null;
  educationJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  status: string;
  answers: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  jobUrl?: string | null;
  optimizedResume?: string | null;
  resumePdfPath?: string | null;
  resumePdfBase64?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationMetadata {
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  jobUrl?: string;
  optimizedResume?: string;
  resumePdfPath?: string;
  resumePdfBase64?: string;
}

/**
 * Interface que qualquer banco SQL/NoSQL do usuário deve implementar
 * para rodar no modo direto 'direct' do SDK.
 */
export interface LinkedInSDKStorage {
  getResume(profileId: string): Promise<Resume | null>;
  getLatestResume(): Promise<Resume | null>;
  upsertResume(profileId: string | null, data: Partial<Resume>): Promise<Resume>;
  
  saveApplication(
    jobId: string,
    answers: string,
    status: string,
    metadata?: ApplicationMetadata
  ): Promise<Application>;
  listApplications(): Promise<Application[]>;
  getApplicationByJobId(jobId: string): Promise<Application | null>;
  updateApplicationStatus(jobId: string, status: string): Promise<Application | null>;
}

// ─── Interfaces de IA (OpenAI Protocol Compatible) ─────────────────────────────

export interface AIConfig {
  /** URL base do chat completion (ex: 'https://api.openai.com/v1' ou 'http://localhost:11434/v1') */
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export interface FormQuestion {
  urn: string;
  required: boolean;
  title: string;
  type: string;
  options?: string[];
  optionUrns?: string[];
  optionEnumStrings?: string[];
  suggestedAnswer?: string;
  prefilledValue?: string;
}

export interface AIAnswer {
  urn: string;
  answer: string;
}

export interface AIResponse {
  answers: AIAnswer[];
}

export interface ParsedResume {
  about: string;
  experiences: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
  }>;
}
