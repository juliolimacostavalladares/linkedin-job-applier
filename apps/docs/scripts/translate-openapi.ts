import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsRoot = path.resolve(__dirname, '..');

const API_KEY = 'sk-4d17a0a7e062b95e-dpfpwg-9d1ccc2f';
const BASE_URL = 'http://localhost:20128/v1/chat/completions';
const MODEL = 'kr/claude-sonnet-4.5';

async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];
  
  console.log(`Translating batch of ${texts.length} items...`);
  
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional technical translator. Translate the given array of English API documentation texts (summaries, descriptions, parameter explanations) into natural and professional Portuguese (pt-BR). Preserve any Markdown formatting, backticks, variables, or html entities. Return ONLY a valid JSON array of translated strings in the exact same order. Do not include any explanations or markdown wrappers.',
        },
        {
          role: 'user',
          content: JSON.stringify(texts),
        },
      ],
      temperature: 0.1,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const rawText = result.choices[0].message.content.trim();
  
  try {
    let cleanText = rawText;
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(cleanText);
    if (!Array.isArray(parsed) || parsed.length !== texts.length) {
      throw new Error('Response is not an array of matching length');
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse translation response:', rawText);
    throw err;
  }
}

// Recursively find all values of keys 'description' and 'summary'
function collectTexts(obj: any, collected: Set<string>) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectTexts(item, collected);
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if ((key === 'description' || key === 'summary') && typeof value === 'string' && value.trim().length > 0) {
      collected.add(value);
    } else {
      collectTexts(value, collected);
    }
  }
}

// Recursively replace values of keys 'description' and 'summary' with their translations
function replaceTexts(obj: any, translationMap: Map<string, string>) {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      replaceTexts(item, translationMap);
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if ((key === 'description' || key === 'summary') && typeof value === 'string') {
      const translated = translationMap.get(value);
      if (translated) {
        obj[key] = translated;
      }
    } else {
      replaceTexts(value, translationMap);
    }
  }
}

async function translateSpec(fileName: string) {
  const inputPath = path.join(docsRoot, 'public', fileName);
  const baseName = path.basename(fileName, '.json');
  const outputPath = path.join(docsRoot, 'public', `${baseName}-pt-BR.json`);

  console.log(`\nReading ${fileName}...`);
  const spec = JSON.parse(readFileSync(inputPath, 'utf-8'));

  const textSet = new Set<string>();
  collectTexts(spec, textSet);
  const uniqueTexts = Array.from(textSet);
  console.log(`Found ${uniqueTexts.length} unique texts to translate.`);

  const translationMap = new Map<string, string>();
  const batchSize = 25;

  for (let i = 0; i < uniqueTexts.length; i += batchSize) {
    const batch = uniqueTexts.slice(i, i + batchSize);
    try {
      const translatedBatch = await translateBatch(batch);
      for (let j = 0; j < batch.length; j++) {
        translationMap.set(batch[j], translatedBatch[j]);
      }
    } catch (err) {
      console.error(`Error translating batch starting at index ${i}. Retrying individually...`, err);
      for (const text of batch) {
        try {
          const translated = await translateBatch([text]);
          translationMap.set(text, translated[0]);
        } catch (singleErr) {
          console.error(`Failed to translate text: "${text}". Keeping original.`, singleErr);
          translationMap.set(text, text);
        }
      }
    }
  }

  replaceTexts(spec, translationMap);
  writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
  console.log(`Saved translated spec to ${outputPath}`);
}

async function main() {
  const specs = ['openapi.json', 'openapi-backend.json', 'openapi-publisher.json'];
  for (const spec of specs) {
    try {
      await translateSpec(spec);
    } catch (err) {
      console.error(`Failed to translate ${spec}:`, err);
    }
  }
  console.log('\nAll specs processed!');
}

main().catch(console.error);
