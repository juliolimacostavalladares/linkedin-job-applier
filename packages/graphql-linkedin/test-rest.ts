import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RestResponse {
  elements?: unknown[];
  included?: Array<{
    $type: string;
    title?: { text: string } | string;
    entityUrn?: string;
    [key: string]: unknown;
  }>;
}

function restliString(val: string): string {
  const escaped = val.replace(/"/g, '\\"');
  return encodeURIComponent(`"${escaped}"`)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

async function run() {
  try {
    const dbPath = path.resolve(__dirname, '../backend/prisma/dev.db');
    const result = execSync(`sqlite3 ${dbPath} "select cookie, csrf from credentials limit 1;"`).toString().trim();
    if (!result) {
      console.error('No credentials found in database!');
      return;
    }
    const [cookie, csrf] = result.split('|');

    const decId = 'com.linkedin.voyager.dash.deco.jobs.search.JobSearchCardsCollection-210';

    const testScenarios = [
      {
        name: 'Broad search: "React", Easy Apply only',
        query: `(origin:JOB_SEARCH_PAGE_SEARCH_BUTTON,keywords:${restliString('React')},selectedFilters:(easyApply:List(true)))`
      },
      {
        name: 'React, Easy Apply, Remote',
        query: `(origin:JOB_SEARCH_PAGE_SEARCH_BUTTON,keywords:${restliString('React')},selectedFilters:(easyApply:List(true),workplaceTypes:List(2)))`
      },
      {
        name: 'React, Easy Apply, Remote, Past 24h',
        query: `(origin:JOB_SEARCH_PAGE_SEARCH_BUTTON,keywords:${restliString('React')},selectedFilters:(easyApply:List(true),workplaceTypes:List(2),timePostedRange:List(r86400)))`
      },
      {
        name: 'Full user Boolean query: Remote, Past 24h',
        query: `(origin:JOB_SEARCH_PAGE_SEARCH_BUTTON,keywords:${restliString(
          'sênior ("Front-end" OR "Desenvolvedor Front-end" OR "Programador") AND (React OR Next.js OR TypeScript) NOT (English OR Fluent OR "Advanced english" OR Presencial OR Hibrido)'
        )},selectedFilters:(easyApply:List(true),workplaceTypes:List(2),timePostedRange:List(r86400)))`
      }
    ];

    for (const ts of testScenarios) {
      console.log(`\n============================`);
      console.log(`Running scenario: ${ts.name}`);
      
      const url = `https://www.linkedin.com/voyager/api/voyagerJobsDashJobCards?decorationId=${decId}&count=24&q=jobSearch&query=${ts.query}&start=0`;
      console.log(`URL: ${url}`);

      try {
        const response = await fetch(url, {
          headers: {
            accept: 'application/vnd.linkedin.normalized+json+2.1',
            'csrf-token': csrf.trim(),
            cookie: cookie.trim(),
            'x-restli-protocol-version': '2.0.0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
          }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        if (response.ok) {
          const json = JSON.parse(text) as RestResponse;
          const elements = json.elements || [];
          const included = json.included || [];
          const jobPostings = included.filter(item => item.$type === 'com.linkedin.voyager.dash.jobs.JobPosting');
          console.log(`SUCCESS! Elements count: ${elements.length}, Included count: ${included.length}`);
          console.log(`Found ${jobPostings.length} JobPosting items.`);
          if (jobPostings.length > 0) {
            jobPostings.slice(0, 5).forEach((p, idx) => {
              const titleVal = p.title;
              const txt = typeof titleVal === 'object' && titleVal !== null ? (titleVal as { text: string }).text : titleVal;
              console.log(`  [${idx}] ${txt} (ID: ${p.entityUrn?.split(':').pop()})`);
            });
            
            // Log first job details to check details
            const firstPost = jobPostings[0];
            console.log(`  First post Keys:`, Object.keys(firstPost));
          }
        } else {
          console.log(`Error Response: ${text.substring(0, 300)}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
