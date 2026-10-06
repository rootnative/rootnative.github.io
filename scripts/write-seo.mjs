/**
 * Writes `robots.txt` and `sitemap.xml` into `dist/` after the export.
 *
 * The sitemap routes come from the exported HTML files, so the sitemap cannot
 * drift from the app. `+not-found` is the 404 page and stays out.
 *
 * This site is the origin root of rootnative.github.io, and a crawler reads
 * `robots.txt` at the root only. So this file lists every sitemap of the
 * origin: this page, and the docs and demo sites the other repositories
 * deploy under their own paths. A new docs site adds one line here.
 */
import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeRobots, writeSitemap } from '@rootnative/seo/node'

const here = dirname(fileURLToPath(import.meta.url))
const dist = resolve(here, '..', 'dist')

const SITE_URL = 'https://rootnative.github.io'
const EXCLUDED = new Set(['+not-found.html', '404.html', '_sitemap.html'])

const SITEMAPS = [
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/ui/sitemap.xml`,
  `${SITE_URL}/ui/demo/sitemap.xml`,
  `${SITE_URL}/inertia/sitemap.xml`,
  `${SITE_URL}/impulse/sitemap.xml`,
]

if (!existsSync(dist)) {
  console.error('[write-seo] dist not found — run `yarn export:web` first.')
  process.exit(1)
}

const urls = readdirSync(dist)
  .filter((file) => file.endsWith('.html') && !EXCLUDED.has(file))
  .sort()
  .map((file) => {
    const route = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`
    return { loc: route, changefreq: 'weekly', priority: route === '/' ? 1 : 0.7 }
  })

const sitemap = await writeSitemap({ outDir: dist, siteUrl: SITE_URL, urls })
const robots = await writeRobots({ outDir: dist, sitemapUrl: SITEMAPS })

console.log(`[write-seo] ${urls.length} routes → ${sitemap}`)
console.log(`[write-seo] ${robots} (${SITEMAPS.length} sitemaps)`)
