export const typeDefs = `#graphql
  type Job {
    id: ID!
    title: String!
    companyInfo: String!
    companyLogo: String
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
  }

  type FormQuestion {
    urn: String!
    required: Boolean!
    title: String!
    type: String!
    options: [String!]!
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

  type ResumePdfResponse {
    success: Boolean!
    text: String!
    pdfBase64: String!
  }

  type WorkExperience {
    company: String!
    role: String!
    duration: String!
    description: String!
  }

  type Education {
    institution: String!
    degree: String!
    duration: String!
  }

  type LinkedInProfile {
    success: Boolean!
    profileId: String!
    name: String!
    headline: String!
    photoUrl: String
    about: String
    experiences: [WorkExperience!]!
    education: [Education!]!
  }

  type Query {
    jobs(cookie: String!, csrf: String!, headersJson: String): [Job!]!
    jobDetail(id: ID!, cookie: String!, csrf: String!, headersJson: String): JobDetail!
    applyForm(id: ID!, cookie: String!, csrf: String!, headersJson: String): ApplyForm!
    resumePdf(profileId: String!, cookie: String!, csrf: String!, headersJson: String): ResumePdfResponse!
    profileInfo(cookie: String!, csrf: String!, headersJson: String): LinkedInProfile!
  }
`;
