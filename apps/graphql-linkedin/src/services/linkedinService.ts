import { logger } from '../utils/logger';
import pdfParse from 'pdf-parse';
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
  private dynamicHeaders: Record<string, string> = {};

  constructor(cookie: string, csrf: string, headersJson?: string | null) {
    this.cookie = cookie;
    this.csrf = csrf;
    if (headersJson) {
      try {
        this.dynamicHeaders = JSON.parse(headersJson);
      } catch (e) {
        logger.error('Error parsing dynamic headers JSON', e);
      }
    }
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
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'csrf-token': this.csrf,
        dnt: '1',
        origin: 'https://www.linkedin.com',
        pragma: 'no-cache',
        priority: 'u=1, i',
        referer: `https://www.linkedin.com/in/${profileId}/`,
        'sec-ch-prefers-color-scheme': 'dark',
        'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        'x-li-anchor-page-key': 'd_flagship3_profile_view_base',
        'x-li-application-instance': 'undefined',
        'x-li-application-version': '0.2.6025',
        'x-li-page-instance': 'urn:li:page:d_flagship3_profile_view_base;JYk6JxbeTUqXjkNpUgFnZg==',
        'x-li-page-instance-tracking-id': 'JYk6JxbeTUqXjkNpUgFnZg==',
        'x-li-pageforestid': '00065461c408e6a4004a1d771b24b000',
        'x-li-rsc-stream': 'true',
        'x-li-traceparent': '00-00065461c408e6a4004a1d771b24b000-3fd4c6e732a05d5c-00',
        'x-li-tracestate': 'LinkedIn=3fd4c6e732a05d5c',
        'x-li-track': '{"clientVersion":"0.2.6025","mpVersion":"0.2.6025","osName":"web","timezoneOffset":-3,"timezone":"America/Sao_Paulo","deviceFormFactor":"DESKTOP","mpName":"web","displayDensity":2,"displayWidth":2560,"displayHeight":1600}',
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
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
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
    // Step 1: Get basic identity from /voyager/api/me
    const apiUrl = 'https://www.linkedin.com/voyager/api/me';
    logger.debug('Fetching profile identity from LinkedIn /me API');

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

    let photoUrl = '';
    if (miniProfile.picture?.rootUrl && miniProfile.picture.artifacts && miniProfile.picture.artifacts.length > 0) {
      const artifact = miniProfile.picture.artifacts.find((art) => art.width === 200) || miniProfile.picture.artifacts[0];
      photoUrl = miniProfile.picture.rootUrl + artifact.fileIdentifyingUrlPathSegment;
    }

    // Step 2: Download profile PDF and parse its text
    let about = '';
    let experiences: WorkExperience[] = [];
    let education: Education[] = [];

    try {
      logger.debug('Downloading LinkedIn profile PDF for parsing', { profileId });
      const pdfBuffer = await this.fetchResumePdf(profileId);
      const pdfData = await pdfParse(Buffer.from(pdfBuffer));
      const pdfText = pdfData.text || '';
      logger.info('PDF downloaded and parsed successfully', { profileId, textLength: pdfText.length });

      const parsed = this.parsePdfText(pdfText);
      about = parsed.about;
      experiences = parsed.experiences;
      education = parsed.education;
    } catch (err) {
      logger.error('Error downloading/parsing profile PDF — using partial identity only', { error: err });
    }

    logger.info('Fetched complete profile info via PDF parsing', { name, profileId });

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

  /**
   * Parses the plain text extracted from the LinkedIn profile PDF.
   * Identifies sections by well-known headings and builds structured data.
   */
  private parsePdfText(text: string): {
    about: string;
    experiences: WorkExperience[];
    education: Education[];
  } {
    // Normalize line endings and collapse excessive blank lines
    const lines = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((l) => l.trim());

    // Section heading patterns (LinkedIn PDFs in PT/EN)
    const SECTION_HEADINGS = [
      /^(sobre|about|resumo|summary)$/i,
      /^(experi[eê]ncia|experience|experi[eê]ncias profissionais?)$/i,
      /^(forma[cç][aã]o|educa[cç][aã]o|education|academic)$/i,
      /^(habilidades|skills|competências)$/i,
      /^(idiomas?|languages?)$/i,
      /^(certificados?|certifications?|cursos?)$/i,
      /^(prêmios?|honras?|awards?)$/i,
      /^(voluntariado?|volunteer)$/i,
      /^(projetos?|projects?)$/i,
      /^(publica[cç][oõ]es?|publications?)$/i,
      /^(recomenda[cç][oõ]es?|recommendations?)$/i,
      /^(interesses?|interests?)$/i,
    ];

    const isHeading = (line: string) =>
      SECTION_HEADINGS.some((rx) => rx.test(line.trim()));

    // Split into sections
    type Section = { heading: string; lines: string[] };
    const sections: Section[] = [];
    let current: Section | null = null;

    for (const line of lines) {
      if (!line) continue;
      if (isHeading(line)) {
        if (current) sections.push(current);
        current = { heading: line.toLowerCase(), lines: [] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) sections.push(current);

    // ─── About ───────────────────────────────────────────────────
    const aboutSection = sections.find((s) =>
      /^(sobre|about|resumo|summary)$/i.test(s.heading)
    );
    const about = aboutSection?.lines.join(' ').trim() || '';

    // ─── Experiences ─────────────────────────────────────────────
    const expSection = sections.find((s) =>
      /^(experi[eê]ncia|experience|experi[eê]ncias profissionais?)$/i.test(s.heading)
    );
    const experiences: WorkExperience[] = [];

    if (expSection && expSection.lines.length > 0) {
      // LinkedIn PDF experience block format (typical):
      // Line 0: Company name
      // Line 1: Role title  (or "Role · Duration")
      // Line 2: Duration    ("Jan 2023 - Presente · X anos")
      // Line 3+: Description (optional, multi-line)
      // Then next entry starts again
      //
      // We detect a new entry when we see a duration-like pattern following a role
      const DURATION_RX = /\d{4}|presente|current|hoje|now/i;
      const ROLE_SEP_RX = / · /;

      let i = 0;
      const expLines = expSection.lines;

      while (i < expLines.length) {
        // Skip empty / separators
        while (i < expLines.length && !expLines[i]) i++;
        if (i >= expLines.length) break;

        // Try to detect a block:
        // Pattern A: company on its own line, then role, then duration
        // Pattern B: "Role · Duration" on one line with company above
        let company = '';
        let role = '';
        let duration = '';
        const descLines: string[] = [];

        const first = expLines[i];

        // Check if line contains a duration (then it's the start of a role line)
        if (ROLE_SEP_RX.test(first) && DURATION_RX.test(first)) {
          // "Role · Company · Duration" pattern
          const parts = first.split(' · ');
          role = parts[0] || '';
          if (parts.length >= 3) {
            company = parts[1] || '';
            duration = parts.slice(2).join(' · ');
          } else {
            duration = parts[1] || '';
          }
          i++;
        } else {
          // first line = company or role
          company = first;
          i++;

          if (i < expLines.length) {
            const second = expLines[i];
            if (ROLE_SEP_RX.test(second)) {
              // "Role · Duration" pattern
              const parts = second.split(' · ');
              role = parts[0] || '';
              duration = parts.slice(1).join(' · ');
              i++;
            } else if (DURATION_RX.test(second) && !ROLE_SEP_RX.test(second)) {
              // second line is pure duration → company was already role
              role = company;
              company = '';
              duration = second;
              i++;
            } else {
              // second line is the role title
              role = second;
              i++;
              if (i < expLines.length) {
                const third = expLines[i];
                if (DURATION_RX.test(third)) {
                  duration = third;
                  i++;
                }
              }
            }
          }
        }

        // Collect description until next entry (detected by another company-like line)
        while (
          i < expLines.length &&
          !isHeading(expLines[i]) &&
          !(DURATION_RX.test(expLines[i]) && !descLines.length)
        ) {
          // Stop if we see what looks like a new entry
          const peek = expLines[i];
          if (
            descLines.length > 0 &&
            !DURATION_RX.test(peek) &&
            i + 1 < expLines.length &&
            DURATION_RX.test(expLines[i + 1])
          ) break;
          descLines.push(peek);
          i++;
        }

        if (role || company) {
          experiences.push({
            company,
            role,
            duration,
            description: descLines.join(' ').trim(),
          });
        }
      }
    }

    // ─── Education ───────────────────────────────────────────────
    const eduSection = sections.find((s) =>
      /^(forma[cç][aã]o|educa[cç][aã]o|education|academic)$/i.test(s.heading)
    );
    const education: Education[] = [];

    if (eduSection && eduSection.lines.length > 0) {
      // LinkedIn PDF education format:
      // Line 0: Institution name
      // Line 1: Degree, Field of study
      // Line 2: Duration ("2018 - 2022")
      const YEAR_RX = /\b\d{4}\b/;
      let i = 0;
      const eduLines = eduSection.lines;

      while (i < eduLines.length) {
        while (i < eduLines.length && !eduLines[i]) i++;
        if (i >= eduLines.length) break;

        const institution = eduLines[i]; i++;
        let degree = '';
        let duration = '';

        if (i < eduLines.length && !YEAR_RX.test(eduLines[i])) {
          degree = eduLines[i]; i++;
        }
        if (i < eduLines.length && YEAR_RX.test(eduLines[i])) {
          duration = eduLines[i]; i++;
        }
        // Skip activity/note lines until next institution
        while (
          i < eduLines.length &&
          !isHeading(eduLines[i]) &&
          !(
            i + 1 < eduLines.length &&
            !YEAR_RX.test(eduLines[i]) &&
            YEAR_RX.test(eduLines[i + 1] || '')
          )
        ) {
          // If next two lines look like institution + year, stop collecting
          if (
            !YEAR_RX.test(eduLines[i]) &&
            i + 2 < eduLines.length &&
            YEAR_RX.test(eduLines[i + 1] || '')
          ) break;
          if (
            !YEAR_RX.test(eduLines[i]) &&
            i + 1 < eduLines.length &&
            !YEAR_RX.test(eduLines[i + 1] || '') &&
            i + 2 < eduLines.length &&
            YEAR_RX.test(eduLines[i + 2] || '')
          ) break;
          i++;
        }

        if (institution) {
          education.push({ institution, degree, duration });
        }
      }
    }

    return { about, experiences, education };
  }


  parseJobsFromExtension(data: LinkedInResponse): Job[] {
    return this.parseJobs(data);
  }

  private getHeaders() {
    const baseHeaders = {
      accept: 'application/vnd.linkedin.normalized+json+2.1',
      'csrf-token': this.csrf,
      cookie: this.cookie,
      'x-restli-protocol-version': '2.0.0',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    };

    const cleanedDynamicHeaders: Record<string, string> = {};
    Object.keys(this.dynamicHeaders).forEach(key => {
      cleanedDynamicHeaders[key.toLowerCase()] = this.dynamicHeaders[key];
    });

    return {
      ...baseHeaders,
      ...cleanedDynamicHeaders,
      'csrf-token': this.csrf,
      cookie: this.cookie,
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
