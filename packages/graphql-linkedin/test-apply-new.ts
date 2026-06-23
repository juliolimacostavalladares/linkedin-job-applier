import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fetchApplyForm } from './src/services/jobs/applyFormFetcher.js';
import { submitApplyForm } from './src/services/jobs/submitApplyFormFetcher.js';

interface RawFormElement {
  $type: string;
  urn?: string;
  formElementUrn?: string;
  title?: { text: string };
  required?: boolean;
  input?: {
    formElementInputValuesResolutionResults?: Array<Record<string, any>>;
  };
}

function getSmartAnswer(title: string, type: string, options?: string[]): string | null {
  const t = title.toLowerCase();

  // Desired Salary
  if (t.includes('salary') || t.includes('pretensão') || t.includes('salarial')) {
    return '6000';
  }

  // Location
  if (t.includes('location') || t.includes('cidade') || t.includes('city') || t.includes('address')) {
    if (type === 'typeahead' || type === 'dropdown') {
      return 'Rio de Janeiro, Brasil|urn:li:fsd_geo:106526531';
    }
    return 'Rio de Janeiro, Brasil';
  }

  // English proficiency text box
  if (t.includes('proficiency') || t.includes('english') || t.includes('inglês') || t.includes('proficiência')) {
    if (type === 'text' || type === 'multiline-text') {
      return 'Fluent. I use English daily for reading documentation, writing code, and collaborating with international teams.';
    }
  }

  // Audio link
  if (t.includes('audio') || t.includes('record') || t.includes('grav')) {
    return 'https://www.speakpipe.com/voice-recorder/msg/mockaudio';
  }

  // Cover letter
  if (t.includes('cover') || t.includes('letter') || t.includes('apresentação')) {
    return 'Please find my resume attached. I am excited to apply for this role.';
  }

  // Summary
  if (t.includes('summary') || t.includes('resumo')) {
    return 'Senior Fullstack Developer with 6+ years of experience in React, Node, and TypeScript.';
  }

  // Experience / English resume multiple choice/dropdown questions
  if (type === 'dropdown' || type === 'checkbox') {
    if (options && options.length > 0) {
      // If it's a Yes/No question
      const hasYes = options.some(opt => opt.toLowerCase() === 'yes' || opt.toLowerCase() === 'sim');
      if (hasYes) {
        return 'Yes';
      }
      return options[0]; // fallback to first option
    }
  }

  return null; // ultimate fallback
}

async function main() {
  const JOB_ID = process.argv[2] || '4426068057';
  let COOKIE = '';
  let CSRF = '';

  try {
    const dbPath = '/Users/macbookpro/Documents/linkedin-job-explorer/apps/backend/prisma/dev.db';
    const out = execSync(`sqlite3 "${dbPath}" "SELECT cookie, csrf FROM credentials ORDER BY updatedAt DESC LIMIT 1;"`).toString().trim();
    if (out) {
      const parts = out.split('|');
      if (parts.length >= 2) {
        COOKIE = parts[0];
        CSRF = parts[1];
      }
    }
  } catch (e: any) {
    console.error('Failed to read credentials from SQLite:', e.message);
    process.exit(1);
  }

  if (!COOKIE || !CSRF) {
    console.error('Missing LINKEDIN_COOKIE or LINKEDIN_CSRF');
    process.exit(1);
  }

  console.log('Fetching apply form details for job:', JOB_ID);
  const form = await fetchApplyForm(JOB_ID, COOKIE, CSRF, {});
  if (!form.success || !form.questions) {
    console.error('Failed to fetch apply form:', form.message);
    process.exit(1);
  }

  // Load the raw response to extract exact prefilled values
  const rawFormPath = '/tmp/linkedin-apply-form-raw.json';
  const rawData = JSON.parse(readFileSync(rawFormPath, 'utf8'));
  const included = (rawData.included ?? []) as RawFormElement[];

  const flatAnswers: Record<string, string> = {};

  // 1. First, copy all prefilled answers from the raw form response
  for (const item of included) {
    if (
      item.$type === 'com.linkedin.voyager.dash.common.forms.FormElement' ||
      item.$type === 'com.linkedin.voyager.dash.jobs.JobApplicationFileUploadFormElement'
    ) {
      const urn = item.formElementUrn ?? item.urn;
      if (!urn) continue;

      const resResults = item.input?.formElementInputValuesResolutionResults;
      if (resResults && resResults.length > 0) {
        for (const res of resResults) {
          if (res.textInputValue !== undefined && res.textInputValue !== null) {
            flatAnswers[urn] = String(res.textInputValue);
          } else if (res.entityInputValue !== undefined && res.entityInputValue !== null) {
            const name = res.entityInputValue.inputEntityName;
            const urnVal = res.entityInputValue.inputEntityUrn;
            const enumVal = res.entityInputValue.optionEnumString;
            if (urnVal) {
              flatAnswers[urn] = `${name}|${urnVal}`;
            } else if (enumVal) {
              flatAnswers[urn] = `${name}||${enumVal}`;
            } else {
              flatAnswers[urn] = String(name);
            }
          } else if (res.dateRangeInputValue !== undefined && res.dateRangeInputValue !== null) {
            // Re-serialize the prefilled dateRange object so convertFlatAnswersToResponses can parse it
            const start = res.dateRangeInputValue.start;
            const end = res.dateRangeInputValue.end;
            flatAnswers[urn] = JSON.stringify({
              start: start ? { year: start.year, month: start.month, day: start.day ?? 1 } : undefined,
              end: end ? { year: end.year, month: end.month, day: end.day ?? 1 } : undefined
            });
          }
        }
      }
    }
  }

  // 2. Fill in missing answers for all fields in the form
  for (const q of form.questions) {
    const existingVal = flatAnswers[q.urn];
    if (existingVal !== undefined && existingVal !== '') {
      console.log(`[Prefilled] ${q.title} -> ${existingVal}`);
      continue;
    }

    const smartAnswer = getSmartAnswer(q.title, q.type, q.options);
    if (smartAnswer !== null) {
      flatAnswers[q.urn] = smartAnswer;
      console.log(`[Generated] ${q.title} -> ${smartAnswer}`);
    }
  }

  console.log('\nSubmitting Easy Apply for job', JOB_ID, '...\n');

  const result = await submitApplyForm(JOB_ID, flatAnswers, COOKIE, CSRF, {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    'x-li-track': '{"clientVersion":"1.13.44852","mpVersion":"1.13.44852","osName":"web","timezoneOffset":-3,"timezone":"America/Sao_Paulo","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":2,"displayWidth":2560,"displayHeight":1600}'
  });

  console.log('RESULT:', JSON.stringify(result, null, 2));

  // Print the payload that was sent
  try {
    const payload = readFileSync('/tmp/linkedin-submit-payload.json', 'utf8');
    console.log('\nSUBMITTED PAYLOAD:', JSON.stringify(JSON.parse(payload), null, 2));
  } catch {}

  // Print the response
  try {
    const resp = readFileSync('/tmp/linkedin-submit-response.json', 'utf8');
    console.log('\nLINKEDIN RESPONSE:', resp);
  } catch {}
}

main().catch(err => {
  console.error(err);
});
