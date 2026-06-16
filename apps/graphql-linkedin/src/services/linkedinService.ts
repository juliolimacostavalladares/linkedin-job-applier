import { logger } from '../utils/logger';
import type { LinkedInResponse, Job, JobDetail, WorkExperience, Education } from '@linkedin-job-applier/shared';

interface LinkedInVectorImage {
  rootUrl?: string;
  artifacts?: Array<{
    width: number;
    fileIdentifyingUrlPathSegment: string;
  }>;
}

interface LinkedInIncludedItem {
  $type?: string;
  entityUrn?: string;
  urn?: string;
  title?: string | { text?: string };
  primaryDescription?: { text?: string };
  logo?: {
    attributes?: Array<{
      detailData?: Record<string, unknown>;
    }>;
  };
  companyDetails?: {
    company?: string;
    logoResolutionResult?: {
      vectorImage?: LinkedInVectorImage;
    };
    '*company'?: string;
  };
  logoResolutionResult?: {
    vectorImage?: LinkedInVectorImage;
  };
  vectorImage?: LinkedInVectorImage;
  profilePicture?: {
    displayImageReferenceResolutionResult?: {
      vectorImage?: LinkedInVectorImage;
    };
  };
  formElementUrn?: string;
  required?: boolean;
  firstName?: string;
  lastName?: string;
  occupation?: string;
  picture?: {
    rootUrl?: string;
    artifacts?: Array<{
      width: number;
      fileIdentifyingUrlPathSegment: string;
    }>;
  };
  uploadFileCtaText?: string;
  mimeTypes?: string[];
  formComponentResolutionResult?: {
    singleLineTextFormComponent?: unknown;
    multilineTextFormComponent?: unknown;
    checkboxFormComponent?: {
      textSelectableOptions?: Array<{ optionText?: { text?: string } }>;
    };
    textEntityListFormComponent?: {
      textSelectableOptions?: Array<{ optionText?: { text?: string } }>;
      placeHolderText?: { text?: string };
    };
    singleTypeaheadEntityFormComponent?: unknown;
    dateRangeFormComponent?: unknown;
  };
  questionGroupingType?: 'RESUME' | 'COVER_LETTER' | string;
  customizedFormSection?: {
    fileUploadFormSection?: {
      title?: string;
      fileUploadFormElement?: unknown;
    };
  };
  formSection?: {
    title?: { text?: string };
    formElementGroups?: Array<{
      '*formElements'?: string[];
    }>;
  };
}

interface LinkedInJobDetailRaw {
  title?: string;
  description?: { text?: string };
  formattedLocation?: string;
  applyMethod?: { companyApplyUrl?: string };
  jobPostingUrl?: string;
  employmentStatus?: string;
  companyDetails?: {
    company?: string;
    logoResolutionResult?: {
      vectorImage?: LinkedInVectorImage;
    };
  };
}

interface LinkedInGraphQLResponse {
  data?: {
    errors?: Array<{ message?: string }>;
    [key: string]: unknown;
  };
  errors?: Array<{ message?: string }>;
  included?: LinkedInIncludedItem[];
}

export class LinkedInService {
  private cookie: string;
  private csrf: string;

  constructor(cookie: string, csrf: string) {
    this.cookie = cookie;
    this.csrf = csrf;
  }

  async fetchJobs(): Promise<Job[]> {
    const apiUrl = 'https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(count:24,jobCollectionSlug:easy-apply,query:(origin:GENERIC_JOB_COLLECTIONS_LANDING),start:0)&queryId=voyagerJobsDashJobCards.e5b6b761ede078dabe8ad857aa42c220';

    logger.debug('Fetching jobs from LinkedIn API');

    const response = await fetch(apiUrl, {
      headers: this.getHeaders(),
      redirect: 'manual',
    });

    this.handleResponseError(response);

    const data = (await response.json()) as LinkedInResponse;
    const jobs = this.parseJobs(data);

    logger.info('Fetched jobs from LinkedIn', { count: jobs.length });

    return jobs;
  }

  async fetchJobDetail(jobId: string): Promise<JobDetail> {
    const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}`;

    logger.debug('Fetching job detail', { jobId });

    const response = await fetch(apiUrl, {
      headers: this.getHeaders(),
      redirect: 'manual',
    });

    this.handleResponseError(response);

    const jsonData = (await response.json()) as { data?: LinkedInJobDetailRaw } & LinkedInJobDetailRaw;
    const data = jsonData.data || jsonData;

    const jobDetail: JobDetail = {
      id: jobId,
      title: data.title || 'Vaga desconhecida',
      description: data.description?.text || '<em>Sem descrição detalhada.</em>',
      location: data.formattedLocation || '',
      url: data.applyMethod?.companyApplyUrl || data.jobPostingUrl || `https://www.linkedin.com/jobs/view/${jobId}`,
      employmentStatus: data.employmentStatus?.split(':').pop() || 'FULL_TIME',
      companyName: data.companyDetails?.company?.split(':').pop() || '',
      companyLogo: data.companyDetails?.logoResolutionResult?.vectorImage
        ? (() => {
            const v = data.companyDetails.logoResolutionResult.vectorImage;
            if (!v?.rootUrl || !v?.artifacts?.length) return '';
            const a = v.artifacts.find((x) => x.width === 100) || v.artifacts[0];
            return v.rootUrl + a.fileIdentifyingUrlPathSegment;
          })()
        : undefined,
    };

    logger.info('Fetched job detail', { jobId, title: jobDetail.title });

    return jobDetail;
  }

  async fetchApplyForm(jobId: string) {
    const apiUrl = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(jobPostingUrn:urn%3Ali%3Afsd_jobPosting%3A${jobId})&queryId=voyagerJobsDashOnsiteApplyApplication.96a2a30d12bccaec2b5ba9acbcbbf97c`;

    const response = await fetch(apiUrl, {
      headers: this.getHeaders(),
      redirect: 'manual',
    });

    this.handleResponseError(response);

    const jsonData = (await response.json()) as LinkedInGraphQLResponse;
    
    const errors = jsonData.data?.errors || jsonData.errors;
    if (errors && errors.length > 0) {
      return { success: false, message: errors[0].message || 'Erro retornado pelo GraphQL' };
    }

    return this.parseApplyForm(jsonData);
  }

  async fetchResumePdf(profileId: string) {
    const apiUrl = 'https://www.linkedin.com/flagship-web/rsc-action/actions/server-request?sduiid=com.linkedin.sdui.requests.profile.saveProfileToPdf';
    
    const payload = {
      requestId: 'com.linkedin.sdui.requests.profile.saveProfileToPdf',
      serverRequest: {
        requestId: 'com.linkedin.sdui.requests.profile.saveProfileToPdf',
        requestedArguments: {
          $type: 'proto.sdui.actions.requests.RequestedArguments',
          payload: { profileId },
        },
        requestedStateKeys: [],
        requestMetadata: { $type: 'proto.sdui.common.RequestMetadata' },
      },
      isApfcEnabled: false,
      isStreaming: false,
      rumPageKey: '',
      states: [],
      requestedArguments: {
        $type: 'proto.sdui.actions.requests.RequestedArguments',
        payload: { profileId },
        requestedStateKeys: [],
        requestMetadata: { $type: 'proto.sdui.common.RequestMetadata' },
        states: [],
        screenId: 'com.linkedin.sdui.flagshipnav.profile.Profile',
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        'csrf-token': this.csrf,
        cookie: this.cookie,
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar PDF do LinkedIn: ${response.statusText}`);
    }

    const textResponse = await response.text();
    const urlMatch = textResponse.match(/"url":"(https:\/\/www\.linkedin\.com\/ambry\/[^"]+)"/);
    
    if (!urlMatch || !urlMatch[1]) {
      throw new Error('URL do PDF não encontrada na resposta');
    }

    const pdfUrl = urlMatch[1];
    const pdfResponse = await fetch(pdfUrl, {
      headers: {
        cookie: this.cookie,
        accept: '*/*',
      },
    });

    if (!pdfResponse.ok) {
      throw new Error(`Erro ao baixar arquivo do LinkedIn Ambry: ${pdfResponse.statusText}`);
    }

    return await pdfResponse.arrayBuffer();
  }

  async fetchProfileInfo(): Promise<{
    success: boolean;
    profileId: string;
    name: string;
    headline: string;
    photoUrl: string;
    about: string;
    experiences: WorkExperience[];
    education: Education[];
  }> {
    const apiUrl = 'https://www.linkedin.com/voyager/api/me';
    logger.debug('Fetching profile info from LinkedIn API');

    const response = await fetch(apiUrl, {
      headers: this.getHeaders(),
      redirect: 'manual',
    });

    this.handleResponseError(response);

    const json = (await response.json()) as LinkedInGraphQLResponse;
    const miniProfile = json.included?.find(
      (item) => item.$type === 'com.linkedin.voyager.identity.shared.MiniProfile'
    );

    if (!miniProfile) {
      throw new Error('MiniProfile não encontrado na resposta do LinkedIn');
    }

    const firstName = miniProfile.firstName || '';
    const lastName = miniProfile.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    const headline = miniProfile.occupation || '';
    const profileId = miniProfile.entityUrn?.split(':').pop() || '';
    const publicIdentifier = (miniProfile as { publicIdentifier?: string }).publicIdentifier || profileId;

    let photoUrl = '';
    if (miniProfile.picture?.rootUrl && miniProfile.picture.artifacts && miniProfile.picture.artifacts.length > 0) {
      const artifact = miniProfile.picture.artifacts.find((art) => art.width === 200) || miniProfile.picture.artifacts[0];
      photoUrl = miniProfile.picture.rootUrl + artifact.fileIdentifyingUrlPathSegment;
    }

    // Now fetch the full profile view
    let about = '';
    let experiences: WorkExperience[] = [];
    let education: Education[] = [];

    try {
      const profileViewUrl = `https://www.linkedin.com/voyager/api/identity/profiles/${publicIdentifier}/profileView`;
      logger.debug('Fetching profileView from LinkedIn API', { publicIdentifier });
      
      const viewResponse = await fetch(profileViewUrl, {
        headers: this.getHeaders(),
        redirect: 'manual',
      });

      this.handleResponseError(viewResponse);

      const viewJson = (await viewResponse.json()) as LinkedInGraphQLResponse;
      const included = viewJson.included || [];

      // Find about/summary
      const profileObj = included.find(
        (item) => item.$type === 'com.linkedin.voyager.identity.profile.Profile'
      );
      about = (profileObj as { summary?: string } | undefined)?.summary || '';

      // Parse experiences (Positions)
      const positions = included.filter(
        (item) => item.$type === 'com.linkedin.voyager.identity.profile.Position'
      ) as Array<{
        companyName?: string;
        title?: string;
        locationName?: string;
        description?: string;
        timePeriod?: {
          startDate?: { month?: number; year?: number };
          endDate?: { month?: number; year?: number };
        };
      }>;

      experiences = positions.map((pos) => ({
        company: pos.companyName || '',
        role: pos.title || '',
        duration: this.formatTimePeriod(pos.timePeriod),
        description: pos.description || '',
      }));

      // Parse education (Educations)
      const schools = included.filter(
        (item) => item.$type === 'com.linkedin.voyager.identity.profile.Education'
      ) as Array<{
        schoolName?: string;
        degreeName?: string;
        fieldOfStudy?: string;
        timePeriod?: {
          startDate?: { year?: number };
          endDate?: { year?: number };
        };
      }>;

      education = schools.map((sch) => ({
        institution: sch.schoolName || '',
        degree: this.formatDegree(sch.degreeName, sch.fieldOfStudy),
        duration: this.formatEducationTimePeriod(sch.timePeriod),
      }));

      logger.info('Fetched complete profile info and profileView', { name, profileId });
    } catch (viewError) {
      logger.error('Error fetching profileView details, using partial me data', { error: viewError });
    }

    return {
      success: true,
      profileId,
      name,
      headline,
      photoUrl,
      about,
      experiences,
      education,
    };
  }

  private formatTimePeriod(tp?: {
    startDate?: { month?: number; year?: number };
    endDate?: { month?: number; year?: number };
  }): string {
    if (!tp) return '';
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    let startStr = '';
    if (tp.startDate?.year) {
      const monthStr = tp.startDate.month ? `${monthNames[tp.startDate.month - 1]} ` : '';
      startStr = `${monthStr}${tp.startDate.year}`;
    }
    
    let endStr = 'Presente';
    if (tp.endDate?.year) {
      const monthStr = tp.endDate.month ? `${monthNames[tp.endDate.month - 1]} ` : '';
      endStr = `${monthStr}${tp.endDate.year}`;
    } else if (!tp.startDate?.year) {
      return '';
    }
    
    return `${startStr} - ${endStr}`;
  }

  private formatEducationTimePeriod(tp?: {
    startDate?: { year?: number };
    endDate?: { year?: number };
  }): string {
    if (!tp) return '';
    const start = tp.startDate?.year ? String(tp.startDate.year) : '';
    const end = tp.endDate?.year ? String(tp.endDate.year) : 'Presente';
    if (!start) return '';
    return `${start} - ${end}`;
  }

  private formatDegree(degreeName?: string, fieldOfStudy?: string): string {
    if (degreeName && fieldOfStudy) {
      return `${degreeName}, ${fieldOfStudy}`;
    }
    return degreeName || fieldOfStudy || '';
  }

  parseJobsFromExtension(data: LinkedInResponse): Job[] {
    return this.parseJobs(data);
  }

  private getHeaders() {
    return {
      accept: 'application/vnd.linkedin.normalized+json+2.1',
      'csrf-token': this.csrf,
      cookie: this.cookie,
      'x-restli-protocol-version': '2.0.0',
    };
  }

  private handleResponseError(response: Response) {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || (response.status >= 300 && response.status < 400)) {
        throw {
          statusCode: response.status >= 300 && response.status < 400 ? 401 : response.status,
          message: 'Acesso negado: O cookie ou token expirou',
        };
      }
      throw {
        statusCode: response.status,
        message: `Erro na API do LinkedIn: ${response.statusText}`,
      };
    }
  }

  private parseJobs(data: LinkedInResponse): Job[] {
    const included = (data.included || []) as LinkedInIncludedItem[];
    const jobsMap = new Map<string, Partial<Job> & { id: string }>();

    // Extract Job Titles
    included.forEach((item) => {
      if (item.$type === 'com.linkedin.voyager.dash.jobs.JobPosting') {
        const idParts = item.entityUrn?.split(':') || [];
        const id = idParts[idParts.length - 1];
        if (id) {
          if (!jobsMap.has(id)) jobsMap.set(id, { id });
          const job = jobsMap.get(id);
          if (job) {
            job.title = typeof item.title === 'string' ? item.title : item.title?.text || '';
          }
        }
      }
    });

    const includedMap = new Map<string, LinkedInIncludedItem>();
    included.forEach((item) => {
      const urn = item.entityUrn || item.urn;
      if (urn) includedMap.set(urn, item);
    });

    // Extract Company and Location
    included.forEach((item) => {
      if (item.$type === 'com.linkedin.voyager.dash.jobs.JobPostingCard') {
        const match = item.entityUrn?.match(/\((\d+),/);
        if (match && match[1]) {
          const id = match[1];
          if (!jobsMap.has(id)) jobsMap.set(id, { id });
          const job = jobsMap.get(id);
          if (job) {
            job.companyInfo = item.primaryDescription?.text || 'Empresa não informada';

            let vectorImage: LinkedInVectorImage | undefined = undefined;
            const detailData = item.logo?.attributes?.[0]?.detailData;
            
            if (detailData) {
              for (const key of Object.keys(detailData)) {
                const val = detailData[key];
                if (typeof val === 'string' && val.startsWith('urn:li:')) {
                  const resolved = includedMap.get(val);
                  if (resolved && resolved.logoResolutionResult?.vectorImage) {
                    vectorImage = resolved.logoResolutionResult.vectorImage;
                  } else if (resolved && resolved.vectorImage) {
                    vectorImage = resolved.vectorImage;
                  } else if (resolved && resolved.profilePicture?.displayImageReferenceResolutionResult?.vectorImage) {
                    vectorImage = resolved.profilePicture.displayImageReferenceResolutionResult.vectorImage;
                  }
                } else if (val && typeof val === 'object') {
                  const valObj = val as Record<string, unknown>;
                  if (valObj.logoResolutionResult && typeof valObj.logoResolutionResult === 'object') {
                    const lrr = valObj.logoResolutionResult as Record<string, unknown>;
                    if (lrr.vectorImage) {
                      vectorImage = lrr.vectorImage as LinkedInVectorImage;
                    }
                  } else if (valObj.vectorImage) {
                    vectorImage = valObj.vectorImage as LinkedInVectorImage;
                  }
                }
              }
            }
            
            if (!vectorImage && item.companyDetails?.['*company']) {
              const company = includedMap.get(item.companyDetails['*company']);
              if (company && company.logoResolutionResult?.vectorImage) {
                vectorImage = company.logoResolutionResult.vectorImage;
              }
            }

            if (vectorImage && vectorImage.rootUrl && vectorImage.artifacts && vectorImage.artifacts.length > 0) {
              const artifact = vectorImage.artifacts.find((a) => a.width === 100) || vectorImage.artifacts[0];
              job.companyLogo = vectorImage.rootUrl + artifact.fileIdentifyingUrlPathSegment;
            }
          }
        }
      }
    });

    return Array.from(jobsMap.values())
      .filter((j): j is Job => typeof j.title === 'string' && typeof j.companyInfo === 'string');
  }

  private parseApplyForm(jsonData: LinkedInGraphQLResponse) {
    const included = jsonData.included || [];
    const formElementsMap = new Map<string, LinkedInIncludedItem>();
    included.forEach((item) => {
      if (item.$type === 'com.linkedin.voyager.dash.common.forms.FormElement' || item.$type === 'com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement') {
        const urn = item.formElementUrn || item.urn;
        if (urn) formElementsMap.set(urn, item);
      }
    });

    const parseField = (el: LinkedInIncludedItem) => {
      let type = 'unknown';
      let options: string[] = [];
      
      if (el.$type === 'com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement') {
        return {
          urn: el.formElementUrn || el.urn || '',
          required: !!el.required,
          title: (typeof el.title === 'string' ? el.title : el.title?.text) || el.uploadFileCtaText || 'Upload File',
          type: 'file',
          options: el.mimeTypes || [],
        };
      }

      const component = el.formComponentResolutionResult;
      if (component?.singleLineTextFormComponent) type = 'text';
      if (component?.multilineTextFormComponent) type = 'multiline-text';
      if (component?.checkboxFormComponent) {
        type = 'checkbox';
        options = component.checkboxFormComponent.textSelectableOptions
          ?.map((o) => o.optionText?.text)
          .filter((t): t is string => typeof t === 'string') || [];
      }
      if (component?.textEntityListFormComponent) {
        type = 'dropdown';
        options = component.textEntityListFormComponent.textSelectableOptions
          ?.map((o) => o.optionText?.text)
          .filter((t): t is string => typeof t === 'string') || [];
      }
      if (component?.singleTypeaheadEntityFormComponent) type = 'typeahead';
      if (component?.dateRangeFormComponent) type = 'date-range';
      
      const fallbackTitle = component?.textEntityListFormComponent?.placeHolderText?.text || 'Unknown Question';
      const questionTitle = (typeof el.title === 'object' ? el.title?.text : el.title) || fallbackTitle;

      return {
        urn: el.urn || '',
        required: !!el.required,
        title: questionTitle,
        type,
        options,
      };
    };

    interface ParsedStep {
      title: string;
      questions: ReturnType<typeof parseField>[];
    }

    const steps: ParsedStep[] = [];
    const sections = included.filter((item) => item.$type === 'com.linkedin.voyager.dash.jobs.JobApplicationFormSection');
    
    sections.forEach((section) => {
      const stepQuestions: ReturnType<typeof parseField>[] = [];
      let title = 'Seção';
      
      if (section.questionGroupingType === 'RESUME' || section.questionGroupingType === 'COVER_LETTER') {
        title = section.customizedFormSection?.fileUploadFormSection?.title || section.questionGroupingType;
        const element = section.customizedFormSection?.fileUploadFormSection?.fileUploadFormElement as LinkedInIncludedItem | undefined;
        if (element) {
          stepQuestions.push(parseField(element));
        }
      } else if (section.formSection) {
        title = section.formSection.title?.text || 'Informações Adicionais';
        const groups = section.formSection.formElementGroups || [];
        groups.forEach((group) => {
          const elements = group['*formElements'] || [];
          elements.forEach((urn: string) => {
            const el = formElementsMap.get(urn);
            if (el) stepQuestions.push(parseField(el));
          });
        });
      }

      if (stepQuestions.length > 0) {
        steps.push({ title, questions: stepQuestions.filter((q) => q.title && q.title !== 'Unknown Question') });
      }
    });

    // Se por algum motivo as seções falharam, fazemos fallback listando todas
    if (steps.length === 0) {
      const flatQuestions = Array.from(formElementsMap.values()).map(parseField).filter((q) => q.title && q.title !== 'Unknown Question');
      if (flatQuestions.length > 0) {
        steps.push({ title: 'Formulário de Candidatura', questions: flatQuestions });
      }
    }

    // Filtrar steps vazios
    const validSteps = steps.filter(s => s.questions.length > 0);

    return { success: true, steps: validSteps, questions: validSteps.flatMap(s => s.questions) };
  }
}
