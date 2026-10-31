/**
 * Writes the head of the not-found page into the static export. Runs after
 * `expo export --platform web` and before `rootnative-seo`, whose audit fails
 * a page with no title.
 *
 * Expo SDK 58 writes each page head of a static export from
 * `generateMetadata`, but the export skips internal routes, so
 * `+not-found.html` gets no head. This writes the head of its `PageHead`. A
 * page that has a `<title>` already stays as it is.
 *
 * Usage: `node scripts/write-not-found-head.mjs [exportDir]`. The default is
 * `dist`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineSite, headTagsHtml, toHeadTags } from '@rootnative/seo'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const file = resolve(ROOT, process.argv[2] ?? 'dist', '+not-found.html')

// Keep in sync with `site` in lib/site.ts and the `PageHead` in
// app/+not-found.tsx. This script does not import them: the package has no
// `"type": "module"`, so Node warns on the import of a `.ts` file.
const site = defineSite({
  name: 'Root Native',
  url: 'https://rootnative.github.io',
  locale: 'en_US',
  titleTemplate: (title) => title,
})
const META = { title: 'Page not found — Root Native', noindex: true }

if (!existsSync(file)) {
  console.error(`[not-found-head] ${file} not found — run \`expo export --platform web\` first.`)
  process.exit(1)
}

const html = readFileSync(file, 'utf8')
if (/<title[\s>]/.test(html)) {
  console.log(`[not-found-head] ${file} has a title already`)
} else {
  writeFileSync(file, html.replace('</head>', `${headTagsHtml(toHeadTags(site, META))}</head>`))
  console.log(`[not-found-head] head → ${file}`)
}
