/**
 * Direct test script for Easy Apply submission.
 * Run with: npx tsx test-apply.ts
 */
import { submitApplyForm } from './src/services/jobs/submitApplyFormFetcher';
import { readFileSync } from 'fs';

const JOB_ID = '4424817153';
const COOKIE = process.env.LINKEDIN_COOKIE ?? '';
const CSRF   = process.env.LINKEDIN_CSRF ?? '';

if (!COOKIE || !CSRF) {
  console.error('Missing LINKEDIN_COOKIE or LINKEDIN_CSRF env vars');
  process.exit(1);
}

const flatAnswers: Record<string, string> = {
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987602977,phoneNumber~country)': 'Brazil (+55)',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987602977,phoneNumber~nationalNumber)': '11988887777',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987603001,numeric)': '5',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987602969,multipleChoice)': 'juliolima1225@gmail.com',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987602993,multipleChoice)': 'Yes',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987602985,multipleChoice)': 'Yes',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987603009,numeric)': '5',
  'urn:li:fsd_formElement:urn:li:jobs_applyformcommon_easyApplyFormElement:(4424817153,20987603017,numeric)': '5',
};

console.log('Submitting Easy Apply for job', JOB_ID, '...\n');

const result = await submitApplyForm(JOB_ID, flatAnswers, COOKIE, CSRF, {});

console.log('RESULT:', JSON.stringify(result, null, 2));

try {
  const payload = readFileSync('/tmp/linkedin-submit-payload.json', 'utf8');
  console.log('\nSUBMITTED PAYLOAD:\n', payload);
} catch { /* ignore */ }

try {
  const resp = readFileSync('/tmp/linkedin-submit-response.json', 'utf8');
  console.log('\nLINKEDIN RESPONSE:\n', resp);
} catch { /* ignore */ }
