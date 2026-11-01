#!/usr/bin/env node
/**
 * Checks each `showcase/<slug>.ts` for the rules that the `ShowcaseEntry` type
 * cannot hold: the text lengths, the links, the date, and the images. It
 * downloads each image to read its type, size and dimensions, so it needs the
 * network. `yarn typecheck` checks the shape of each entry.
 *
 * Node 24 removes the types from an entry when it imports the file, so this
 * script reads the same file that the site bundles. A file whose name starts
 * with `_` is not an app.
 *
 *   yarn showcase:check
 */
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'showcase')

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const GITHUB_HANDLE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
const DATE = /^\d{4}-\d{2}-\d{2}$/

const MAX_NAME = 30
const MAX_TAGLINE = 90
const MAX_ALT = 150
const MAX_SCREENSHOTS = 4
const ICON_EDGE = { min: 256, max: 1024 }
const MAX_ICON_BYTES = 200 * 1024
const MAX_SCREENSHOT_BYTES = 300 * 1024
const MAX_SCREENSHOT_EDGE = 2000
const FETCH_TIMEOUT_MS = 20_000
const FETCH_ATTEMPTS = 2

/**
 * The site reads each image from its host at view time. A file on GitHub or on
 * the site of the app keeps each later change of the image with the owner of
 * the app, and sends the visitor to no third host.
 */
const IMAGE_HOSTS = ['raw.githubusercontent.com']
const STORE_HOSTS = { appStore: 'apps.apple.com', playStore: 'play.google.com' }

/** Reads the type and the size of a PNG, JPEG or WebP file from its header. */
function imageInfo(buffer) {
  if (buffer.length >= 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { type: 'png', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        return null
      }
      const marker = buffer[offset + 1]
      if (marker === 0xff) {
        offset += 1
        continue
      }
      // SOF0 to SOF15 hold the size. C4, C8 and CC share the range but are not frames.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return {
          type: 'jpeg',
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        }
      }
      offset += 2 + buffer.readUInt16BE(offset + 2)
    }
    return null
  }
  if (
    buffer.length >= 30 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buffer.toString('ascii', 12, 16)
    if (chunk === 'VP8 ') {
      return {
        type: 'webp',
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      }
    }
    if (chunk === 'VP8L') {
      const bits = buffer.readUInt32LE(21)
      return { type: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
    if (chunk === 'VP8X') {
      return {
        type: 'webp',
        width: buffer.readUIntLE(24, 3) + 1,
        height: buffer.readUIntLE(27, 3) + 1,
      }
    }
  }
  return null
}

async function download(url) {
  let lastError
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
      if (!response.ok) {
        return { error: `the server sent HTTP ${response.status}` }
      }
      return { buffer: Buffer.from(await response.arrayBuffer()) }
    } catch (error) {
      lastError = error
    }
  }
  return { error: `the download failed: ${lastError?.cause?.code ?? lastError?.message}` }
}

/** Returns the problems of one image URL, and its size when the file is an image. */
async function checkImage(url, { maxBytes, imageHosts }) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return { problems: [`"${url}" is not a URL`] }
  }
  if (parsed.protocol !== 'https:') {
    return { problems: [`${url}: use an https:// link`] }
  }
  if (!imageHosts.includes(parsed.hostname)) {
    return { problems: [`${url}: put the file on ${imageHosts.join(' or ')}`] }
  }
  const { buffer, error } = await download(url)
  if (error) {
    return { problems: [`${url}: ${error}`] }
  }
  const info = imageInfo(buffer)
  if (!info) {
    return { problems: [`${url}: use a PNG, JPEG or WebP file`] }
  }
  const problems = []
  if (buffer.length > maxBytes) {
    problems.push(
      `${url}: ${Math.ceil(buffer.length / 1024)} KB, but the limit is ${maxBytes / 1024} KB`,
    )
  }
  return { problems, info }
}

function checkLinks(links) {
  const problems = []
  const entries = Object.entries(links ?? {}).filter(([, value]) => value !== undefined)
  if (entries.length === 0) {
    problems.push('links: add at least one link')
  }
  for (const [key, value] of entries) {
    let url
    try {
      url = new URL(value)
    } catch {
      problems.push(`links.${key}: "${value}" is not a URL`)
      continue
    }
    if (key === 'expoGo') {
      if (url.protocol !== 'exp:' && url.protocol !== 'exps:') {
        problems.push('links.expoGo: use an exp:// link')
      }
      continue
    }
    if (url.protocol !== 'https:') {
      problems.push(`links.${key}: use an https:// link`)
    }
    if (STORE_HOSTS[key] && url.hostname !== STORE_HOSTS[key]) {
      problems.push(`links.${key}: use a link on ${STORE_HOSTS[key]}`)
    }
  }
  return problems
}

function checkDate(added) {
  if (typeof added !== 'string' || !DATE.test(added)) {
    return ['added: write the date as YYYY-MM-DD']
  }
  const date = new Date(`${added}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== added) {
    return [`added: ${added} is not a real date`]
  }
  if (date.getTime() > Date.now()) {
    return [`added: ${added} is in the future`]
  }
  return []
}

function checkText(label, value, max) {
  if (typeof value !== 'string' || value.trim() === '') {
    return [`${label}: write a value`]
  }
  return value.length > max ? [`${label}: ${value.length} characters, but the limit is ${max}`] : []
}

function duplicates(list) {
  return [...new Set((list ?? []).filter((item, index) => list.indexOf(item) !== index))]
}

function webHost(links) {
  try {
    return links?.web ? [new URL(links.web).hostname] : []
  } catch {
    return []
  }
}

async function checkIcon(url, imageHosts) {
  if (typeof url !== 'string') {
    return ['icon: write the URL of the icon']
  }
  const { problems, info } = await checkImage(url, { maxBytes: MAX_ICON_BYTES, imageHosts })
  if (
    info &&
    (info.width !== info.height || info.width < ICON_EDGE.min || info.width > ICON_EDGE.max)
  ) {
    problems.push(
      `${url}: ${info.width} × ${info.height}, but the icon must be square and ${ICON_EDGE.min} to ${ICON_EDGE.max} px wide`,
    )
  }
  return problems.map((problem) => `icon: ${problem}`)
}

async function checkScreenshot(screenshot, label, imageHosts) {
  const problems = checkText(`${label}.alt`, screenshot.alt, MAX_ALT)
  const urls = [screenshot.url, screenshot.darkUrl].filter((url) => url !== undefined)
  if (typeof screenshot.url !== 'string') {
    problems.push(`${label}.url: write the URL of the screenshot`)
  }
  const results = await Promise.all(
    urls.map((url) => checkImage(url, { maxBytes: MAX_SCREENSHOT_BYTES, imageHosts })),
  )
  for (const { problems: imageProblems, info } of results) {
    problems.push(...imageProblems.map((problem) => `${label}: ${problem}`))
    if (info && Math.max(info.width, info.height) > MAX_SCREENSHOT_EDGE) {
      problems.push(
        `${label}: ${info.width} × ${info.height}, but the long edge must be ${MAX_SCREENSHOT_EDGE} px or less`,
      )
    }
  }
  const [light, dark] = results.map((result) => result.info)
  if (light && dark && (light.width !== dark.width || light.height !== dark.height)) {
    problems.push(`${label}: the light and the dark file must have the same size`)
  }
  return problems
}

async function checkApp(file) {
  const slug = path.basename(file, '.ts')
  const problems = []
  if (!SLUG.test(slug)) {
    problems.push('the file name: use lowercase letters, digits and single hyphens')
  }
  const entry = (await import(pathToFileURL(path.join(ROOT, file)).href)).default
  if (!entry || typeof entry !== 'object') {
    return { problems: [...problems, 'export the entry as the default export'] }
  }

  problems.push(...checkText('name', entry.name, MAX_NAME))
  problems.push(...checkText('tagline', entry.tagline, MAX_TAGLINE))
  if (typeof entry.author !== 'string' || !GITHUB_HANDLE.test(entry.author)) {
    problems.push('author: write a GitHub user name, with no @')
  }
  for (const field of ['packages', 'platforms']) {
    for (const item of duplicates(entry[field])) {
      problems.push(`${field}: ${item} is in the list two times`)
    }
  }
  problems.push(...checkLinks(entry.links))
  problems.push(...checkDate(entry.added))

  const imageHosts = [...IMAGE_HOSTS, ...webHost(entry.links)]
  const screenshots = Array.isArray(entry.screenshots) ? entry.screenshots : []
  if (screenshots.length === 0 || screenshots.length > MAX_SCREENSHOTS) {
    problems.push(`screenshots: add 1 to ${MAX_SCREENSHOTS} screenshots`)
  }
  const imageProblems = await Promise.all([
    checkIcon(entry.icon, imageHosts),
    ...screenshots.map((screenshot, index) =>
      checkScreenshot(screenshot, `screenshots[${index}]`, imageHosts),
    ),
  ])
  problems.push(...imageProblems.flat())

  return { slug, problems, name: typeof entry.name === 'string' ? entry.name : undefined }
}

const files = readdirSync(ROOT)
  .filter((file) => file.endsWith('.ts') && !file.startsWith('_'))
  .sort()

const report = []
const names = new Map()
for (const file of files) {
  const { slug = file, problems, name } = await checkApp(file)
  if (name) {
    const key = name.trim().toLowerCase()
    if (names.has(key)) {
      problems.push(`name: showcase/${names.get(key)}.ts has the same name`)
    } else {
      names.set(key, slug)
    }
  }
  for (const problem of problems) {
    report.push(`showcase/${file}: ${problem}`)
  }
}

if (report.length > 0) {
  console.error(report.join('\n'))
  console.error(`\n${report.length} problem(s) in the showcase.`)
  process.exit(1)
}
console.log(`showcase: ${files.length} app(s) pass.`)
