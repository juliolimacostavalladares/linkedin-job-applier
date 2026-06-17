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
    suggestedAnswer: String
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

  # ─── Queries ───────────────────────────────────────────────────────────────
  type Query {
    jobs(cookie: String!, csrf: String!, headersJson: String, keywords: String, remote: Boolean, past24h: Boolean): [Job!]!
    jobDetail(id: ID!, cookie: String!, csrf: String!, headersJson: String): JobDetail!
    applyForm(id: ID!, cookie: String!, csrf: String!, headersJson: String): ApplyForm!

    """Downloads the LinkedIn profile PDF and returns raw text + base64."""
    resumePdf(profileId: String!, cookie: String!, csrf: String!, headersJson: String): ResumePdfResponse!

    """Returns minimal LinkedIn identity (name, headline, photoUrl, profileId)."""
    profileInfo(cookie: String!, csrf: String!, headersJson: String): LinkedInProfile!
  }
`;
