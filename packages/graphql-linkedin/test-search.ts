import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SearchResponse {
  data?: {
    errors?: unknown[];
  };
  errors?: unknown[];
  included?: Array<{
    $type: string;
    title?: { text: string } | string;
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

    const queryId = 'voyagerJobsDashJobCards.e5b6b761ede078dabe8ad857aa42c220';

    const testKeywords = [
      {
        name: 'Simple keyword "React" within collection',
        keywords: 'React'
      },
      {
        name: 'Boolean query with parentheses and quotes within collection',
        keywords: restliString('sênior ("Front-end" OR "Desenvolvedor Front-end" OR "Programador")')
      },
      {
        name: 'Full user Boolean query within collection',
        keywords: restliString('sênior ("Front-end" OR "Desenvolvedor Front-end" OR "Programador") AND (React OR Next.js OR TypeScript) NOT (English OR Fluent OR "Advanced english" OR Presencial OR Hibrido)')
      }
    ];

    for (const tk of testKeywords) {
      console.log(`\n============================`);
      console.log(`Test: ${tk.name}`);
      
      const variables = `(count:24,jobCollectionSlug:easy-apply,query:(origin:JOB_SEARCH_PAGE_SEARCH_BUTTON,keywords:${tk.keywords}),start:0)`;
      const url = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=${variables}&queryId=${queryId}`;
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
        if (response.ok) {
          const json = (await response.json()) as SearchResponse;
          const errors = json.data?.errors || json.errors;
          if (errors && errors.length > 0) {
            console.log('API returned GraphQL errors:', errors);
          } else {
            const included = json.included ?? [];
            const jobPostings = included.filter(item => item.$type === 'com.linkedin.voyager.dash.jobs.JobPosting');
            console.log(`SUCCESS! Found ${included.length} total items, including ${jobPostings.length} JobPosting items.`);
            if (jobPostings.length > 0) {
              const firstTitle = jobPostings[0].title;
              const titleText = typeof firstTitle === 'object' && firstTitle !== null ? (firstTitle as { text: string }).text : firstTitle;
              console.log(`First job: "${titleText}"`);
              // Let's print out the first 3 job titles
              jobPostings.slice(0, 3).forEach((p, idx) => {
                const titleVal = p.title;
                const txt = typeof titleVal === 'object' && titleVal !== null ? (titleVal as { text: string }).text : titleVal;
                console.log(`  [${idx}] ${txt}`);
              });
            }
          }
        } else {
          const text = await response.text();
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
