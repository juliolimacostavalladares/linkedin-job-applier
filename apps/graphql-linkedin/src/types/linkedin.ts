/**
 * Internal LinkedIn API interface definitions.
 * All modules import types from here – no circular dependencies.
 */

export interface LinkedInVectorImage {
  rootUrl?: string;
  artifacts?: Array<{
    width: number;
    fileIdentifyingUrlPathSegment: string;
  }>;
}

/** Footer item on a JobPostingCard — EASY_APPLY_TEXT type marks Easy Apply jobs */
export interface LinkedInFooterItem {
  type?: string;
  text?: { text?: string } | null;
  timeAt?: number | null;
}

export interface LinkedInApplyMethod {
  /** `com.linkedin.voyager.dash.jobs.ComplexOnsiteApply` = Easy Apply */
  $type?: string;
  /** Present only on external apply jobs */
  companyApplyUrl?: string;
}

export interface LinkedInIncludedItem {
  $type?: string;
  entityUrn?: string;
  urn?: string;
  title?: string | { text?: string };
  primaryDescription?: { text?: string };
  /** Present on JobPosting items – used to detect Easy Apply vs external */
  applyMethod?: LinkedInApplyMethod;
  /** Present on JobPostingCard – EASY_APPLY_TEXT entry marks Easy Apply jobs */
  footerItems?: LinkedInFooterItem[];
  applied?: boolean;
  appliedAt?: number;
  jobSeekerJobStateActions?: Array<{ jobSeekerJobStateEnums?: string }>;
  viewedByJobPosterAt?: number | null;
  closed?: boolean;
  logo?: {
    attributes?: Array<{
      detailData?: Record<string, unknown>;
    }>;
    vectorImage?: LinkedInVectorImage;
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
    phoneNumberFormComponent?: unknown;
    numericFormComponent?: unknown;
    radioButtonFormComponent?: {
      selectableOptionsResolutionResults?: Array<{
        textSelectableOption?: {
          option?: {
            optionUrn?: string | null;
            optionEnumString?: string | null;
          };
          optionText?: { text?: string };
        };
      }>;
    };
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
  lastUsedAt?: number;
  jobApplicationForms?: Array<Record<string, unknown>>;
}

export interface LinkedInJobDetailRaw {
  title?: string;
  description?: { text?: string };
  formattedLocation?: string;
  applyMethod?: LinkedInApplyMethod;
  jobPostingUrl?: string;
  employmentStatus?: string;
  companyDetails?: {
    company?: string;
    logoResolutionResult?: {
      vectorImage?: LinkedInVectorImage;
    };
  };
}

export interface LinkedInGraphQLResponse {
  data?: {
    errors?: Array<{ message?: string }>;
    [key: string]: unknown;
  };
  errors?: Array<{ message?: string }>;
  included?: LinkedInIncludedItem[];
}
