#!/usr/bin/env node
// Builds the five library cards in the README from each library's own mark.
//
//   yarn build:cards
//
// Why this script exists, given that CLAUDE.md says this repository keeps no
// copy of a library mark. That rule is about what the SITE draws: the app reads
// every mark from `raw.githubusercontent.com` at view time, so a mark that
// changes upstream reaches a visitor without a release here. A README cannot do
// that. GitHub serves `assets/card-*.svg` as an image, and an image may not
// fetch a second image, so the one place a mark can live in a README card is
// inside the file.
//
// So these five files are copies, and this script is what keeps them honest --
// the same call `build-icons.mjs` makes for the four icon slots. They are
// DERIVED, never authored: when a mark changes in its own repo, the fix is to
// re-run this and commit the output, not to edit an SVG.
//
// The card design follows `components/library-card.tsx`, so the README and the
// site show the same card: the mark on a plain surface, the name, a status
// pill, the description, the meta line, and the Demo and GitHub buttons. Two
// parts of that card cannot cross over. The live preview needs a running app,
// and the version pill would be a number frozen at build time -- the README
// carries shields.io badges for versions instead, which are fetched when the
// page is viewed.
//
// Colours are the dark scheme of the site's own theme, read from
// `@rootnative/core` so the two cannot drift.

import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createMaterialTheme } from '@rootnative/core/create-theme'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = path.join(ROOT, 'assets')
const RAW = 'https://raw.githubusercontent.com'

// The seed and variant in lib/theme.ts. A README is always dark art, so only
// the dark scheme is read.
const { colors: C } = createMaterialTheme('#60A5FA', { variant: 'vibrant' }).darkTheme

const W = 584
const H = 240
const PAD = 24
const RIGHT = W - PAD
const MARK_SIZE = 38

// The site's font stack, which is what the type tokens carry.
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

// One container role per status, from `library-card.tsx`.
const STATUS_COLORS = {
  stable: { bg: C.primaryContainer, fg: C.onPrimaryContainer },
  beta: { bg: C.tertiaryContainer, fg: C.onTertiaryContainer },
  alpha: { bg: C.secondaryContainer, fg: C.onSecondaryContainer },
  experimental: { bg: C.surfaceVariant, fg: C.onSurfaceVariant },
  'in the lab': { bg: C.surfaceVariant, fg: C.onSurfaceVariant },
}

// The `s` button size tokens from @rootnative/components.
const BUTTON = { height: 40, padding: 16, gap: 8, icon: 20 }

const GITHUB_PATH =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
const OPEN_IN_NEW_PATH =
  'M14 3v2h3.59L7.76 14.83l1.41 1.41L19 6.41V10h2V3h-7zm5 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z'
// MDI `flask-outline`, the fallback icon a card without a mark gets.
const FLASK_PATH =
  'M5,19A1,1 0 0,0 6,20H18A1,1 0 0,0 19,19C19,18.79 18.93,18.59 18.82,18.43L13,8.35V4H11V8.35L5.18,18.43C5.07,18.59 5,18.79 5,19M6,22A3,3 0 0,1 3,19C3,18.4 3.18,17.84 3.5,17.37L9,7.81V6A1,1 0 0,1 8,5V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V5A1,1 0 0,1 15,6V7.81L20.5,17.37C20.82,17.84 21,18.4 21,19A3,3 0 0,1 18,22H6M13,16L14.34,14.66L16.27,18H7.73L10.39,13.39L13,16M14.5,13A1,1 0 0,1 13.5,12A1,1 0 0,1 14.5,11A1,1 0 0,1 15.5,12A1,1 0 0,1 14.5,13Z'

/**
 * The cards, in the order the README lays them out.
 *
 * `description` and `meta` mirror `LIBRARIES` in lib/libraries.ts, broken into
 * lines by hand because SVG text does not wrap. `featured` is the same flag the
 * site reads, and here it only picks the larger type roles.
 *
 * The mark is the `-dark` variant of each repo's brand art. The site reads the
 * light `*-mark.png`, because it renders on both schemes; a README card is dark
 * in either, so it takes the variant built for a dark ground.
 */
const CARDS = [
  {
    file: 'card-ui.svg',
    name: 'ui',
    id: 'ui',
    mark: `${RAW}/rootnative/ui/main/assets/brand/rootnative-mark-dark.svg`,
    npmPackage: '@rootnative/components',
    description: [
      'Material Design 3 components that take any design',
      'system. Swap the theme, keep the API.',
    ],
    meta: 'TypeScript · docs &amp; examples available',
    featured: true,
    demo: true,
    label: 'ui — Material Design 3 components that take any design system',
  },
  {
    file: 'card-inertia.svg',
    name: 'inertia',
    id: 'inertia',
    mark: `${RAW}/rootnative/inertia/main/assets/brand/inertia-mark-dark.svg`,
    npmPackage: '@rootnative/inertia',
    description: [
      'Animations as props. No shared values, no worklets,',
      'no useAnimatedStyle to write.',
    ],
    meta: 'built on react-native-reanimated',
    featured: true,
    demo: true,
    label: 'inertia — animations as props, built on Reanimated',
  },
  {
    file: 'card-impulse.svg',
    name: 'impulse',
    id: 'impulse',
    mark: `${RAW}/rootnative/impulse/main/assets/brand/impulse-mark-dark.svg`,
    npmPackage: '@rootnative/impulse',
    description: [
      'Declarative gesture primitives — a gesture is written as an intent,',
      'not assembled from a builder chain.',
    ],
    meta: 'useTap, useDoubleTap, useLongPress, useDrag · react-native-gesture-handler',
    demo: true,
    label: 'impulse — declarative gesture primitives for React Native',
  },
  {
    file: 'card-game-engine.svg',
    name: 'game-engine',
    id: 'ge',
    mark: `${RAW}/rootnative/game-engine/main/assets/brand/game-engine-mark-dark.svg`,
    description: [
      'A 2D and 3D engine that runs inside Expo Go. No custom',
      'native build, no eject.',
    ],
    meta: 'TypeScript',
    status: 'experimental',
    label: 'game-engine — a 2D and 3D engine that runs inside Expo Go',
  },
  {
    file: 'card-more.svg',
    name: "what's next",
    id: 'more',
    mark: null,
    description: ['More small libraries are on the way, each one built to', 'work with the rest.'],
    meta: 'watch the org to be first to know',
    status: 'in the lab',
    label: "what's next — more libraries are on the way",
  },
]

/** `statusFromVersion` in lib/libraries.ts, so both read a version the same way. */
function statusFromVersion(version) {
  if (!version) {
    return 'in the lab'
  }
  const prerelease = version.split('-')[1]?.toLowerCase() ?? ''
  if (prerelease.startsWith('alpha')) {
    return 'alpha'
  }
  if (prerelease.startsWith('beta') || prerelease.startsWith('rc')) {
    return 'beta'
  }
  return Number(version.split('.')[0]) >= 1 ? 'stable' : 'experimental'
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`)
  }
  return response.text()
}

/**
 * The published status of a package, read from the registry the way the site
 * reads it. A card is art, so a status baked in at build time is the most this
 * medium can carry.
 */
async function publishedStatus(npmPackage) {
  const body = await fetchText(`https://registry.npmjs.org/${npmPackage}/latest`)
  return statusFromVersion(JSON.parse(body).version)
}

/**
 * A brand mark, inlined at `size`.
 *
 * Every id inside it is prefixed, because five cards go into one README and a
 * duplicate gradient id would make one card paint with another's gradient.
 */
function inlineMark(source, id, x, y, size) {
  const body = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/id="([^"]+)"/g, `id="${id}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${id}-$1)`)
    .trim()
  return `  <g transform="translate(${x} ${y}) scale(${(size / 64).toFixed(5)})">\n${body}\n  </g>`
}

/** The badge a card without a mark gets: `sm` padding around a 22px icon. */
function iconBadge(x, y, size) {
  const icon = 22
  const offset = (size - icon) / 2
  return `  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="12" fill="${C.primaryContainer}"/>
  <g transform="translate(${x + offset} ${y + offset}) scale(${(icon / 24).toFixed(5)})"><path d="${FLASK_PATH}" fill="${C.onPrimaryContainer}"/></g>`
}

/**
 * Rough advance width of a string.
 *
 * SVG has no layout pass, so a pill and a button have to be sized before the
 * text goes in. This is an estimate for a system sans, and every box it sizes
 * is padded well past its error.
 */
function textWidth(text, size, weight) {
  return text.length * size * (weight >= 500 ? 0.55 : 0.53)
}

function statusPill(status, right, centerY) {
  const { bg, fg } = STATUS_COLORS[status]
  const height = 24
  const width = Math.round(textWidth(status, 11, 500) + 0.5 * status.length + 16)
  const x = right - width
  return `  <rect x="${x}" y="${centerY - height / 2}" width="${width}" height="${height}" rx="12" fill="${bg}"/>
  <text x="${x + width / 2}" y="${centerY + 4}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="500" letter-spacing="0.5" fill="${fg}">${status}</text>`
}

function buttonWidth(label) {
  return Math.round(
    BUTTON.padding + textWidth(label, 14, 500) + BUTTON.gap + BUTTON.icon + BUTTON.padding,
  )
}

function button(label, x, y, kind) {
  const width = buttonWidth(label)
  const { height, padding, icon } = BUTTON
  const tonal = kind === 'tonal'
  const fg = tonal ? C.onSecondaryContainer : C.primary
  // A tonal Demo trails its icon; an outlined GitHub leads with its mark.
  const iconX = tonal ? x + width - padding - icon : x + padding
  const labelX = tonal ? x + padding : x + padding + icon + BUTTON.gap
  const surface = tonal
    ? `  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${C.secondaryContainer}"/>`
    : `  <rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="${height / 2 - 0.5}" fill="none" stroke="${C.outline}"/>`

  return `${surface}
  <g transform="translate(${iconX} ${y + (height - icon) / 2}) scale(${(icon / 24).toFixed(5)})"><path d="${tonal ? OPEN_IN_NEW_PATH : GITHUB_PATH}" fill="${fg}"/></g>
  <text x="${labelX}" y="${y + 25}" font-family="${FONT}" font-size="14" font-weight="500" letter-spacing="0.1" fill="${fg}">${label}</text>`
}

function card(spec, status, markSource) {
  const { name, id, description, meta, featured, demo, label } = spec
  // headlineSmall / titleLarge for the name, bodyLarge / bodyMedium for the
  // description: the two roles `library-card.tsx` picks by `featured`.
  const titleSize = featured ? 24 : 22
  const bodySize = featured ? 16 : 14
  const bodyLead = featured ? 24 : 20
  const rowCenter = PAD + MARK_SIZE / 2
  const descTop = PAD + MARK_SIZE + 16
  const descBaseline = descTop + Math.round(bodyLead * 0.7)
  const buttonsY = H - PAD - BUTTON.height

  const lines = description
    .map((line, i) => `    <tspan x="${PAD}" y="${descBaseline + i * bodyLead}">${line}</tspan>`)
    .join('\n')

  const buttons = []
  let x = PAD
  if (demo) {
    buttons.push(button('Demo', x, buttonsY, 'tonal'))
    x += buttonWidth('Demo') + 8
  }
  buttons.push(button('GitHub', x, buttonsY, 'outlined'))

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="11.5" fill="${C.surface}" stroke="${C.outlineVariant}"/>

${markSource ? inlineMark(markSource, id, PAD, PAD, MARK_SIZE) : iconBadge(PAD, PAD, MARK_SIZE)}

  <text x="${PAD + MARK_SIZE + 16}" y="${rowCenter + titleSize * 0.36}" font-family="${FONT}" font-size="${titleSize}" font-weight="400" fill="${C.onSurface}">${name}</text>
${statusPill(status, RIGHT, rowCenter)}

  <text font-family="${FONT}" font-size="${bodySize}" letter-spacing="${featured ? 0.5 : 0.25}" fill="${C.onSurfaceVariant}">
${lines}
  </text>

  <text x="${PAD}" y="${descTop + bodyLead * 2 + 28}" font-family="${FONT}" font-size="12" font-weight="500" letter-spacing="0.5" fill="${C.onSurfaceVariant}">${meta}</text>

${buttons.join('\n')}
</svg>
`
}

async function main() {
  console.log(`Surface: ${C.surface}  outline: ${C.outlineVariant}`)
  for (const spec of CARDS) {
    const [markSource, status] = await Promise.all([
      spec.mark ? fetchText(spec.mark) : null,
      spec.npmPackage ? publishedStatus(spec.npmPackage) : spec.status,
    ])
    writeFileSync(path.join(ASSET_DIR, spec.file), card(spec, status, markSource))
    console.log(
      `  assets/${spec.file.padEnd(22)} ${status.padEnd(12)} ${spec.mark ? 'mark' : 'icon fallback'}`,
    )
  }
}

await main()
