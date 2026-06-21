import swaggerJSDoc from 'swagger-jsdoc';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LinkedIn Gateway Service API',
      version: '1.0.0',
      description: 'REST and GraphQL gateway service to interface with LinkedIn Voyager APIs securely.',
    },
    components: {
      securitySchemes: {
        LinkedInCookie: {
          type: 'apiKey',
          in: 'header',
          name: 'x-linkedin-cookie',
          description: 'LinkedIn session cookie (contains li_at, JSESSIONID, etc.)',
        },
        LinkedInCsrf: {
          type: 'apiKey',
          in: 'header',
          name: 'x-linkedin-csrf',
          description: 'LinkedIn CSRF token (must match JSESSIONID from cookie)',
        },
      },
      schemas: {
        Job: {
          type: 'object',
          required: ['id', 'title', 'companyInfo'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the job posting on LinkedIn.',
              example: '3827649182'
            },
            title: {
              type: 'string',
              description: 'Job title.',
              example: 'Senior React Developer'
            },
            companyInfo: {
              type: 'string',
              description: 'Company name or brief metadata.',
              example: 'Google'
            },
            companyLogo: {
              type: 'string',
              description: 'URL of the company logo image (if available).',
              example: 'https://media.licdn.com/dms/image/...'
            },
            applied: {
              type: 'boolean',
              description: 'Whether the user has already applied to this job.',
              example: false
            },
            appliedThroughSystem: {
              type: 'boolean',
              description: 'Whether the user applied using this gateway service.',
              example: false
            },
            language: {
              type: 'string',
              enum: ['en', 'pt'],
              description: 'Language code of the job posting.',
              example: 'en'
            }
          }
        },
        JobDetail: {
          type: 'object',
          required: ['id', 'title', 'description', 'location', 'url', 'employmentStatus', 'companyName'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique LinkedIn job posting ID.',
              example: '3827649182'
            },
            title: {
              type: 'string',
              description: 'The title of the position.',
              example: 'Senior React Developer'
            },
            description: {
              type: 'string',
              description: 'Full description text of the job in HTML format.',
              example: 'We are looking for a Senior React Developer...'
            },
            location: {
              type: 'string',
              description: 'Formatted job location.',
              example: 'San Francisco, CA (Hybrid)'
            },
            url: {
              type: 'string',
              description: 'Direct URL to view the job posting on LinkedIn.',
              example: 'https://www.linkedin.com/jobs/view/3827649182'
            },
            employmentStatus: {
              type: 'string',
              description: 'Employment type classification.',
              example: 'FULL_TIME'
            },
            companyName: {
              type: 'string',
              description: 'Name of the hiring company.',
              example: 'Google'
            },
            companyLogo: {
              type: 'string',
              description: 'URL of the hiring company logo.',
              example: 'https://media.licdn.com/dms/image/...'
            },
            applyForm: {
              $ref: '#/components/schemas/ApplyForm'
            },
            applied: {
              type: 'boolean',
              description: 'Whether the user has already applied.',
              example: false
            },
            appliedThroughSystem: {
              type: 'boolean',
              description: 'Whether applied using this gateway service.',
              example: false
            },
            appliedAt: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp of application (if applied through system).',
              example: '2026-06-21T18:00:00.000Z'
            },
            appliedOnLinkedIn: {
              type: 'boolean',
              description: 'Whether LinkedIn records show an application.',
              example: false
            },
            viewedByJobPosterAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'ISO timestamp when the job poster viewed the application.',
              example: null
            },
            closed: {
              type: 'boolean',
              description: 'Whether the job posting is closed for applications.',
              example: false
            },
            language: {
              type: 'string',
              enum: ['en', 'pt'],
              description: 'Language code of the job description.',
              example: 'en'
            }
          }
        },
        ApplyForm: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates whether the form retrieval was successful.',
              example: true
            },
            message: {
              type: 'string',
              description: 'Error or status message.',
              example: 'Form loaded successfully'
            },
            steps: {
              type: 'array',
              description: 'If a multi-step form, structured steps and questions.',
              items: {
                type: 'object',
                required: ['title', 'questions'],
                properties: {
                  title: {
                    type: 'string',
                    description: 'Title of the step.',
                    example: 'Contact Info'
                  },
                  questions: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/FormQuestion'
                    }
                  }
                }
              }
            },
            questions: {
              type: 'array',
              description: 'If a flat form, lists all questions.',
              items: {
                $ref: '#/components/schemas/FormQuestion'
              }
            },
            referenceId: {
              type: 'string',
              description: 'Unique Client-generated base64 token representing this form session, needed for submission.',
              example: 'YWJjZGVmZ2hpamtsbW5vcA=='
            },
            resumeUploadFormElementUrn: {
              type: 'string',
              description: 'URN of the resume file upload field, if present.',
              example: 'urn:li:fs_easyApplyFormElement:(3827649182,7,fileUpload)'
            },
            resumeUrns: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Available resume document URNs on LinkedIn, sorted by usage recency.',
              example: ['urn:li:fsd_resume:123456789']
            },
            optimizedResume: {
              type: 'string',
              description: 'Optimized text version of resume.',
              example: 'John Doe - Software Engineer...'
            },
            optimizedResumePdfBase64: {
              type: 'string',
              description: 'Base64 payload of optimized resume PDF.',
              example: 'JVBER...'
            }
          }
        },
        FormQuestion: {
          type: 'object',
          required: ['urn', 'required', 'title', 'type'],
          properties: {
            urn: {
              type: 'string',
              description: 'The unique LinkedIn URN identifier of the form element/question.',
              example: 'urn:li:fs_easyApplyFormElement:(3827649182,12,text)'
            },
            required: {
              type: 'boolean',
              description: 'Whether an answer is mandatory.',
              example: true
            },
            title: {
              type: 'string',
              description: 'The text question or label presented to the user.',
              example: 'How many years of experience do you have with React?'
            },
            type: {
              type: 'string',
              description: 'The question type.',
              example: 'text'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'For multiple-choice/dropdown options, display strings.',
              example: ['Yes', 'No']
            },
            optionUrns: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Parallel array of URNs matching the options.',
              example: ['urn:li:fs_easyApplyFormElementOption:1', 'urn:li:fs_easyApplyFormElementOption:2']
            },
            optionEnumStrings: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Parallel array of raw enum strings for options.',
              example: ['YES', 'NO']
            },
            suggestedAnswer: {
              type: 'string',
              description: 'Suggested or AI-generated answer.',
              example: 'Yes'
            },
            prefilledValue: {
              type: 'string',
              description: 'Prefilled answer value if parsed from LinkedIn.',
              example: 'John Doe'
            }
          }
        },
        ApplySubmissionResult: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the application was submitted successfully.',
              example: true
            },
            message: {
              type: 'string',
              description: 'Status or error message detail.',
              example: 'Application submitted successfully'
            }
          }
        },
        CreatePostResult: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the post was successfully created.',
              example: true
            },
            postId: {
              type: 'string',
              description: 'The sharing URN/ID of the created post.',
              example: '7209384729'
            },
            error: {
              type: 'string',
              description: 'Error details if creation failed.',
              example: 'Invalid cookies'
            }
          }
        },
        DeletePostResult: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether deletion was successful.',
              example: true
            },
            error: {
              type: 'string',
              description: 'Error details if deletion failed.',
              example: 'Post not found'
            }
          }
        },
        ProfileInfo: {
          type: 'object',
          required: ['success', 'profileId', 'name', 'headline', 'photoUrl', 'about', 'experiences', 'education'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if identity fetching was successful.',
              example: true
            },
            profileId: {
              type: 'string',
              description: 'The target member URN ID.',
              example: 'ACoAAB...'
            },
            name: {
              type: 'string',
              description: 'The user\'s full name.',
              example: 'John Doe'
            },
            headline: {
              type: 'string',
              description: 'The user\'s headline.',
              example: 'Senior Software Engineer'
            },
            photoUrl: {
              type: 'string',
              description: 'The user\'s profile photo URL.',
              example: 'https://media.licdn.com/dms/image/...'
            },
            about: {
              type: 'string',
              description: 'The user\'s \'About\' description parsed from the profile PDF.',
              example: 'Passionate engineer with experience in React and Node...'
            },
            experiences: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/WorkExperience'
              }
            },
            education: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Education'
              }
            }
          }
        },
        WorkExperience: {
          type: 'object',
          required: ['company', 'role', 'duration', 'description'],
          properties: {
            company: {
              type: 'string',
              description: 'The company name.',
              example: 'Google'
            },
            role: {
              type: 'string',
              description: 'The role/title held.',
              example: 'Senior Software Engineer'
            },
            duration: {
              type: 'string',
              description: 'The duration of employment.',
              example: 'Jan 2020 - Present'
            },
            description: {
              type: 'string',
              description: 'Responsibilities and achievements description.',
              example: 'Led development of core front-end applications...'
            }
          }
        },
        Education: {
          type: 'object',
          required: ['institution', 'degree', 'duration'],
          properties: {
            institution: {
              type: 'string',
              description: 'The school/university name.',
              example: 'Stanford University'
            },
            degree: {
              type: 'string',
              description: 'The degree obtained.',
              example: 'B.S. Computer Science'
            },
            duration: {
              type: 'string',
              description: 'The duration of studies.',
              example: '2016 - 2020'
            }
          }
        },
        ResumePdfResult: {
          type: 'object',
          required: ['success', 'text', 'pdfBase64'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the PDF retrieval and parsing was successful.',
              example: true
            },
            text: {
              type: 'string',
              description: 'The full text extracted from the PDF file.',
              example: 'John Doe Resume...'
            },
            pdfBase64: {
              type: 'string',
              description: 'The base64 encoded representation of the PDF file.',
              example: 'JVBER...'
            }
          }
        }
      },
    },
    tags: [
      {
        name: 'Jobs',
        description: 'Operations related to LinkedIn easy-apply jobs',
      },
      {
        name: 'Posts',
        description: 'Operations related to publishing and managing posts',
      },
      {
        name: 'Profile',
        description: 'Operations related to parsing and retrieving user profile information',
      },
    ],
    security: [
      {
        LinkedInCookie: [],
        LinkedInCsrf: [],
      },
    ],
  },
  apis: [
    path.join(projectRoot, '../graphql-linkedin/src/routes/*.ts'),
    path.join(projectRoot, '../graphql-linkedin/src/routes/*.js'),
  ],
};

// Ensure public directory exists
const publicDir = path.join(projectRoot, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

const spec = swaggerJSDoc(swaggerOptions);
const openapiPath = path.join(publicDir, 'openapi.json');
writeFileSync(openapiPath, JSON.stringify(spec, null, 2));
console.log('OpenAPI spec generated at', openapiPath);

async function main() {
  const outputDir = path.join(projectRoot, 'content/docs/api');
  
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }
  mkdirSync(outputDir, { recursive: true });

  // Use absolute path to ensure correct resolution from monorepo root
  const absoluteInputPath = path.resolve(projectRoot, 'public/openapi.json');

  const openapi = createOpenAPI({
    input: [absoluteInputPath],
  });

  await generateFiles({
    input: openapi,
    output: outputDir,
    groupBy: 'tag',
  });

  // Write meta.json files to organize sidebar structure under content/docs/api
  writeFileSync(
    path.join(outputDir, 'meta.json'),
    JSON.stringify({
      title: 'API Reference',
      pages: ['jobs', 'posts', 'profile'],
    }, null, 2)
  );

  writeFileSync(
    path.join(outputDir, 'jobs/meta.json'),
    JSON.stringify({
      title: 'Jobs API',
      pages: ['listJobs', 'getJobDetail', 'getApplyForm', 'submitApplication'],
    }, null, 2)
  );

  writeFileSync(
    path.join(outputDir, 'posts/meta.json'),
    JSON.stringify({
      title: 'Posts API',
      pages: ['createPost', 'deletePost'],
    }, null, 2)
  );

  writeFileSync(
    path.join(outputDir, 'profile/meta.json'),
    JSON.stringify({
      title: 'Profile API',
      pages: ['getProfileInfo', 'getResumePdf'],
    }, null, 2)
  );

  console.log('Fumadocs API documentation files generated successfully!');
}

main().catch((err) => {
  console.error('Failed to generate Fumadocs API documentation:', err);
  process.exit(1);
});
