# fumadocs i18n Compatibility Issue: toFumadocsSource() Returns Empty Source

## Summary

When using `fumadocs-mdx@15.0.12` with `fumadocs-core@16.10.5` and i18n configuration, the `toFumadocsSource()` method returns a Source object with **zero pages loaded**, despite collections being correctly generated.

## Environment

```json
{
  "fumadocs-core": "16.10.5",
  "fumadocs-mdx": "15.0.12",
  "fumadocs-ui": "16.10.5",
  "next": "16.2.9"
}
```

**Note:** `fumadocs-mdx@16.x` does not exist - 15.0.12 is the latest available version.

## Configuration

### source.config.ts
```typescript
export const docs = defineDocs({
  dir: 'content/docs',
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
  },
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});
```

### Content Structure
```
content/docs/
  ├── en/
  │   ├── index.mdx
  │   ├── quickstart.mdx
  │   ├── meta.json
  │   └── ... (29 more files)
  └── pt-BR/
      ├── index.mdx
      ├── quickstart.mdx
      ├── meta.json
      └── ... (29 more files)
```

Total: 59 files per language (118 total)

### lib/source.ts
```typescript
import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), openapiPlugin()],
});
```

## Expected Behavior

When calling `source.getPages('en')` or `source.getPages('pt-BR')`, it should return an array of page objects for that language.

## Actual Behavior

**Collections are generated correctly:**
- `.source/server.ts` contains all 118 imports (59 per language)
- Paths include language prefix: `"en/quickstart.mdx"`, `"pt-BR/index.mdx"`
- Export structure looks correct:
  ```javascript
  export const docs = await create.docs("docs", "content/docs", 
    {...meta imports...}, 
    {...doc imports...}
  );
  ```

**But runtime behavior shows ZERO pages loaded:**
```javascript
// Debug output from page component
console.log('[DEBUG] Total pages for en:', source.getPages('en').length);
// Output: [DEBUG] Total pages for en : 0

console.log('[DEBUG] Total pages for pt-BR:', source.getPages('pt-BR').length);
// Output: [DEBUG] Total pages for pt-BR : 0
```

**Result:** All pages return 404 because `source.getPage(slugs, language)` returns `null`.

## Root Cause Analysis

The issue appears to be in the `docs.toFumadocsSource()` conversion:

1. ✅ Collections generated correctly by fumadocs-mdx 15.x
2. ✅ All files exist and are imported in `.source/server.ts`
3. ✅ i18n config is defined in source.config.ts
4. ❌ When `toFumadocsSource()` converts collections to fumadocs-core format, the result has 0 pages

**Hypothesis:** Incompatibility between fumadocs-mdx 15.x's i18n implementation and what fumadocs-core 16.x expects.

## Reproduction Steps

1. Create a Next.js project with fumadocs
2. Install `fumadocs-core@16.10.5`, `fumadocs-mdx@15.0.12`, `fumadocs-ui@16.10.5`
3. Configure i18n in source.config.ts with 2+ locales
4. Create content files in language-prefixed folders (e.g., `content/docs/en/`, `content/docs/pt-BR/`)
5. Run `fumadocs-mdx` to generate collections
6. Check that `.source/server.ts` contains all imports
7. Start dev server and try to access any page
8. Add debug: `console.log(source.getPages('en').length)` in page component
9. Observe: returns 0 despite collections being generated

## Debug Output

```javascript
[DEBUG] Route params: {normalized: Array(0), lang: 'en'}
[DEBUG] Total pages for en : 0
[DEBUG] Page found: false null
```

## Workaround

Remove i18n configuration and point directly to a single language folder:

```typescript
export const docs = defineDocs({
  dir: 'content/docs/pt-BR', // Point to single language
  // i18n: {
  //   defaultLocale: 'pt-BR',
  //   locales: ['pt-BR', 'en'],
  // },
  // ... rest of config
});
```

This allows pages to load but loses multi-language support.

## Questions

1. Is fumadocs-mdx 15.x intended to be compatible with fumadocs-core 16.x?
2. Is there a migration guide for i18n between these versions?
3. When will fumadocs-mdx 16.x be released?
4. Is there a different recommended approach for i18n with these version combinations?

## Additional Context

- Path aliases are configured correctly: `"collections/*": ["./.source/*"]`
- No errors or warnings during fumadocs-mdx generation
- Collections file size is normal (~20KB for `.source/server.ts`)
- Issue affects all languages equally (not specific to one locale)
- Removing i18n config allows pages to load (confirming i18n is the issue)

## Related Documentation

- fumadocs-mdx configuration: https://fumadocs.dev/docs/mdx
- fumadocs-core source API: https://fumadocs.dev/docs/headless/source-api
- fumadocs i18n guide: https://fumadocs.dev/docs/headless/internationalization
