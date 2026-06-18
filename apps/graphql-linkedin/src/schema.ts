export const typeDefs = `#graphql
  # ─── Jobs ──────────────────────────────────────────────────────────────────
  type Job {
    id: ID!
    title: String!
    companyInfo: String!
    companyLogo: String
    applied: Boolean
  }

  type JobDetail {
    id: ID!
    title: String!
    description: String!
    location: String!
    url: String!
    employmentStatus: String!
    companyName: String!
    companyLogo: String
    appliedOnLinkedIn: Boolean
    viewedByJobPosterAt: String
    closed: Boolean
  }

  # ─── Apply Form ────────────────────────────────────────────────────────────
  type FormQuestion {
    urn: String!
    required: Boolean!
    title: String!
    type: String!
    options: [String!]!
    optionUrns: [String!]
    """Parallel to options[]: enum string identifier for multipleChoice fields that lack a URN (e.g. Yes/No)."""
    optionEnumStrings: [String!]
    suggestedAnswer: String
    prefilledValue: String
  }

  type ApplyFormStep {
    title: String!
    questions: [FormQuestion!]!
  }

  type ApplyForm {
    success: Boolean!
    message: String
    steps: [ApplyFormStep!]
    questions: [FormQuestion!]
    """Client-generated referenceId to forward in the submit payload."""
    referenceId: String
    """Form element URN for the resume upload field."""
    resumeUploadFormElementUrn: String
    """All available resume URNs sorted by lastUsedAt desc. Use [0] as the preferred."""
    resumeUrns: [String!]
  }

  # ─── Resume / Profile ──────────────────────────────────────────────────────

  """
  Raw PDF download response. Parsing (about, experiences, education)
  is done on the backend by the AI service — NOT here.
  """
  type ResumePdfResponse {
    success: Boolean!
    text: String!
    pdfBase64: String!
  }

  """
  Minimal identity fetched from /voyager/api/me.
  Structural parsing lives in the backend AI service.
  """
  type LinkedInProfile {
    success: Boolean!
    profileId: String!
    name: String!
    headline: String!
    photoUrl: String
  }

  # ─── Application Submission ──────────────────────────────────────────────────
  type ApplySubmissionResult {
    success: Boolean!
    message: String
  }

  # ─── Queries & Mutations ─────────────────────────────────────────────────────
  type Query {
    jobs(cookie: String!, csrf: String!, headersJson: String, keywords: String, remote: Boolean, past24h: Boolean): [Job!]!
    jobDetail(id: ID!, cookie: String!, csrf: String!, headersJson: String): JobDetail!
    applyForm(id: ID!, cookie: String!, csrf: String!, headersJson: String): ApplyForm!

    """Downloads the LinkedIn profile PDF and returns raw text + base64."""
    resumePdf(profileId: String!, cookie: String!, csrf: String!, headersJson: String): ResumePdfResponse!

    """Returns minimal LinkedIn identity (name, headline, photoUrl, profileId)."""
    profileInfo(cookie: String!, csrf: String!, headersJson: String): LinkedInProfile!
  }

  # ─── Post Creation ──────────────────────────────────────────────────────────
  type CreatePostResult {
    success: Boolean!
    postId: String
    error: String
  }

  type Mutation {
    createPost(
      cookie: String!
      csrf: String!
      headersJson: String
      text: String!
    ): CreatePostResult!

    submitApplication(
      id: ID!
      """Flat answers map (JSON): { formElementUrn: answerString }"""
      formValues: String!
      cookie: String!
      csrf: String!
      headersJson: String
      """
      Optional: pre-typed FormResponse[] serialized as JSON.
      When provided, takes priority over formValues for building the payload.
      """
      formResponsesJson: String
      """
      Client-generated referenceId from GET apply-form. Required to avoid LinkedIn 400.
      """
      referenceId: String
      """
      Optional: FileUploadResponse[] serialized as JSON for resume upload.
      """
      fileUploadResponsesJson: String
      """
      Shortcut: URN of the selected resume (e.g. from applyForm.resumeUrns[0]).
      When provided along with resumeUploadFormElementUrn, auto-builds fileUploadResponses.
      """
      resumeUrn: String
      """The form element URN for the resume upload field (from applyForm.resumeUploadFormElementUrn)."""
      resumeUploadFormElementUrn: String
    ): ApplySubmissionResult!
  }
`;

