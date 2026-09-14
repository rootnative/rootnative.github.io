#!/usr/bin/env node
// Builds this app's icon slots from the rootnative GitHub org avatar.
//
//   yarn build:icons
//
// Why this script exists at all, given that CLAUDE.md says never to keep a copy
// of a mark in this repository. That rule is about the four LIBRARY marks: each
// one lives in its own repo, this site reads it from `raw.githubusercontent.com`
// at view time, and a bundled copy would be a second source of truth that goes
// stale. None of that can apply to an icon slot. A favicon is referenced by the
// static export's HTML and has to be a file on disk, so a view-time URL is not
// an option here.
//
// So these four files are copies, and this script is what keeps them honest:
// they are DERIVED, never authored. The org avatar remains the single source of
// truth, and when it changes on GitHub the fix is to re-run this and commit the
// output -- not to edit a PNG.
//
// Everything is done in this file rather than with a dependency, which is the
// same call `ui`, `inertia`, `impulse`, and `game-engine` make in their
// `build-brand.mjs`. A PNG decoder is `zlib.inflateSync` plus an unfilter loop,
// and a resampler is two nested loops; neither is worth a package, and neither
// can break in CI over a transitive update.
//
// What actually ships from this repo is the web build, so `favicon.png` is the
// only one of the four a visitor ever sees. The other three are generated
// because `app.json` declares them and because three real icons beside one
// blank placeholder is worse than four of either. Two caveats on those:
//
//   - `splash.png` is read through the `expo-splash-screen` plugin entry in
//     `app.json`, not the top-level `splash` key that Expo SDK 57 dropped. Its
//     `inset` below and that plugin's `imageWidth` are a PAIR: the plugin
//     renders this 512 px square at 400 dp, so an inset of 0.4 puts the mark at
//     about 160 dp. Change one and change the other.
//   - The avatar is 460x460 and GitHub will not serve it larger -- `?size=1024`
//     returns the same 460 px image. Nothing generated here can be sharper than
//     that, which is what `SLOT_SIZE` is about.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = path.join(ROOT, 'assets')

// The org avatar. The org has no repository, so this is the source of truth for
// the mark -- it changes in GitHub's org settings, not by a commit anywhere.
// Unsized on purpose: this is the one caller that wants every pixel GitHub has,
// where `lib/brand-marks.ts` asks for `?size=144` to keep the hero request
// small.
const AVATAR_URL = 'https://avatars.githubusercontent.com/rootnative'

/**
 * Edge length of the three app-icon slots.
 *
 * 512, not the 1024 the placeholders were and not the 1024 Apple asks of a
 * store submission, because the source avatar is 460 px and GitHub will not
 * serve it larger. Every pixel past 460 is invented by the resampler, and at
 * 1024 those three slots cost 810 KB of committed binary against 318 KB at 512
 * -- two and a half times the weight, for detail that is not in the source and
 * cannot be.
 *
 * That trade is only correct because of what this repo ships. Only the web
 * build is deployed (see CLAUDE.md), the top-level `splash` key is legacy on
 * SDK 57, and `favicon.png` -- the one slot a visitor actually sees -- is 64 px
 * and unaffected either way. These three exist so `app.json` does not point at
 * blank placeholders.
 *
 * If a real store build ever needs 1024, the fix is to upload a
 * higher-resolution avatar to the GitHub org and re-run this. Do NOT raise this
 * constant on its own: that only makes the resampler invent more.
 */
const SLOT_SIZE = 512

/**
 * Edge length of the tile embedded in the README hero, and its corner radius.
 *
 * The hero draws it at 72 px, so 144 keeps it sharp at 2x -- the same trade
 * `?size=144` makes for the site in `lib/brand-marks.ts`. The radius is the
 * site's `radius={18}` at that scale.
 */
const HERO_MARK_SIZE = 144
const HERO_MARK_RADIUS = 36

/**
 * The block in `assets/hero.svg` this script owns.
 *
 * The hero is hand-authored art, and the mark inside it is not: a README cannot
 * fetch anything at view time, so the one mark it shows has to be bytes on
 * disk. Keeping those bytes behind a marker makes them DERIVED, like the four
 * icon slots -- when the org avatar changes, `yarn build:icons` rewrites this
 * and nobody edits base64 by hand.
 */
const HERO_MARK_BLOCK = /(<!-- build:org-mark -->)([\s\S]*?)(<!-- \/build:org-mark -->)/

// --- PNG decode --------------------------------------------------------------

/**
 * Decode a non-interlaced 8-bit RGB or RGBA PNG to a flat RGBA buffer.
 *
 * Deliberately narrow. GitHub serves the avatar as 8-bit RGB, and a decoder
 * that quietly mishandled a palette or a 16-bit source would produce a wrong
 * icon rather than an error, so anything else throws by name.
 */
function decodePng(buf) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (!signature.every((byte, i) => buf[i] === byte)) {
    throw new Error('not a PNG')
  }

  let width = 0
  let height = 0
  let channels = 0
  const idat = []

  for (let at = 8; at < buf.length;) {
    const length = buf.readUInt32BE(at)
    const type = buf.toString('ascii', at + 4, at + 8)
    const data = buf.subarray(at + 8, at + 8 + length)
    at += 12 + length

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      const depth = data[8]
      const colourType = data[9]
      const interlace = data[12]
      if (depth !== 8) throw new Error(`bit depth ${depth} unsupported, need 8`)
      if (interlace !== 0) throw new Error('interlaced PNG unsupported')
      if (colourType === 2) channels = 3
      else if (colourType === 6) channels = 4
      else throw new Error(`colour type ${colourType} unsupported, need 2 or 6`)
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }
  }

  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const rgba = Buffer.alloc(width * height * 4)
  // One scanline of already-unfiltered bytes, for the Up and Paeth predictors.
  let previous = Buffer.alloc(stride)

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))

    for (let i = 0; i < stride; i++) {
      // `a` is the byte one pixel left, `b` the byte above, `c` above-left.
      const a = i >= channels ? line[i - channels] : 0
      const b = previous[i]
      const c = i >= channels ? previous[i - channels] : 0
      let value = line[i]

      if (filter === 1) value += a
      else if (filter === 2) value += b
      else if (filter === 3) value += (a + b) >> 1
      else if (filter === 4) {
        // Paeth: pick whichever of a, b, c the linear estimate is closest to.
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      } else if (filter !== 0) {
        throw new Error(`unknown scanline filter ${filter} on row ${y}`)
      }

      line[i] = value & 0xff
    }

    for (let x = 0; x < width; x++) {
      const from = x * channels
      const to = (y * width + x) * 4
      rgba[to] = line[from]
      rgba[to + 1] = line[from + 1]
      rgba[to + 2] = line[from + 2]
      rgba[to + 3] = channels === 4 ? line[from + 3] : 255
    }

    previous = line
  }

  return { width, height, rgba }
}

// --- resampling --------------------------------------------------------------

/**
 * Resample to `size` x `size`, choosing the filter by direction.
 *
 * Box-average when shrinking and bilinear when growing, because neither filter
 * is right in both directions: a box average degenerates to nearest-neighbour
 * once each destination pixel covers less than one source pixel, and bilinear
 * shrinking by 7x -- which is the favicon -- samples four of every fifty source
 * pixels and aliases the monogram into noise.
 */
function resample(src, size) {
  const out = Buffer.alloc(size * size * 4)
  const ratio = src.width / size
  const shrinking = ratio > 1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0

      if (shrinking) {
        const x0 = Math.floor(x * ratio)
        const y0 = Math.floor((y * src.height) / size)
        const x1 = Math.max(x0 + 1, Math.floor((x + 1) * ratio))
        const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * src.height) / size))
        let n = 0
        for (let sy = y0; sy < y1; sy++) {
          for (let sx = x0; sx < x1; sx++) {
            const o = (sy * src.width + sx) * 4
            r += src.rgba[o]
            g += src.rgba[o + 1]
            b += src.rgba[o + 2]
            a += src.rgba[o + 3]
            n++
          }
        }
        r /= n
        g /= n
        b /= n
        a /= n
      } else {
        // Sample at pixel centres, or the whole image shifts half a pixel.
        const fx = Math.min(src.width - 1, Math.max(0, (x + 0.5) * ratio - 0.5))
        const fy = Math.min(src.height - 1, Math.max(0, ((y + 0.5) * src.height) / size - 0.5))
        const x0 = Math.floor(fx)
        const y0 = Math.floor(fy)
        const x1 = Math.min(src.width - 1, x0 + 1)
        const y1 = Math.min(src.height - 1, y0 + 1)
        const tx = fx - x0
        const ty = fy - y0

        for (const [k, offset] of [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
        ]) {
          const at = (px, py) => src.rgba[(py * src.width + px) * 4 + offset]
          const top = at(x0, y0) + (at(x1, y0) - at(x0, y0)) * tx
          const bottom = at(x0, y1) + (at(x1, y1) - at(x0, y1)) * tx
          const value = top + (bottom - top) * ty
          if (k === 0) r = value
          else if (k === 1) g = value
          else if (k === 2) b = value
          else a = value
        }
      }

      const o = (y * size + x) * 4
      out[o] = Math.round(r)
      out[o + 1] = Math.round(g)
      out[o + 2] = Math.round(b)
      out[o + 3] = Math.round(a)
    }
  }

  return { width: size, height: size, rgba: out }
}

/**
 * A `size` x `size` canvas of `ground`, with `art` centred on it at `inset` of
 * the canvas width.
 *
 * `inset` is what keeps an Android adaptive foreground inside the 66% safe
 * circle, and what gives the splash mark room. At 1 the art fills the canvas.
 */
function tile(size, ground, source, inset) {
  const artSize = Math.round(size * inset)
  const art = resample(source, artSize)
  const offset = Math.round((size - artSize) / 2)
  const rgba = Buffer.alloc(size * size * 4)

  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = ground[0]
    rgba[i * 4 + 1] = ground[1]
    rgba[i * 4 + 2] = ground[2]
    rgba[i * 4 + 3] = 255
  }

  // The avatar is fully opaque, so this is a copy rather than a blend.
  for (let y = 0; y < artSize; y++) {
    for (let x = 0; x < artSize; x++) {
      const from = (y * artSize + x) * 4
      const to = ((y + offset) * size + (x + offset)) * 4
      art.rgba.copy(rgba, to, from, from + 4)
    }
  }

  return { width: size, height: size, rgba }
}

/**
 * A `size` x `size` tile of the avatar with rounded corners, for the README
 * hero.
 *
 * The site draws the same mark through `BrandMark` with `radius={18}` at 72 px.
 * A README is a static file and cannot reach a style, so the radius has to be
 * in the pixels. Without it the avatar is a black box on a light page, which is
 * the whole reason that prop exists -- see "Brand marks" in CLAUDE.md.
 *
 * Coverage is sampled on a 4x4 grid inside each pixel, so a corner is a ramp
 * rather than a staircase.
 */
function roundedTile(size, source, radius) {
  const art = resample(source, size)
  const rgba = Buffer.from(art.rgba)
  const samples = 4

  const inside = (x, y) => {
    // Distance past the corner's straight run, on each axis.
    const dx = Math.max(radius - x, x - (size - radius), 0)
    const dy = Math.max(radius - y, y - (size - radius), 0)
    return dx * dx + dy * dy <= radius * radius
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let covered = 0
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          if (inside(x + (sx + 0.5) / samples, y + (sy + 0.5) / samples)) covered++
        }
      }
      const at = (y * size + x) * 4 + 3
      rgba[at] = Math.round((rgba[at] * covered) / (samples * samples))
    }
  }

  return { width: size, height: size, rgba }
}

// --- PNG encode --------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

/**
 * Choose a scanline filter the way libpng does: encode the row five ways and
 * keep whichever has the smallest sum of absolute signed deviations, which
 * correlates well with how small deflate will get it.
 *
 * The sibling `build-brand.mjs` scripts get away with filter 0 for every row,
 * because they draw flat-toned geometry where a whole row is one repeated
 * colour and deflate already reduces it to nothing. This one resamples a
 * photographic avatar, so its rows are ramps and noise.
 *
 * Measured, not assumed: across these four slots adaptive filtering is worth
 * about 9% (918 KB to 836 KB at 1024 px). Real but modest -- the avatar carries
 * sensor-style noise that no predictor helps with, and that noise, not the
 * filter choice, is what sets the file size. The `SLOT_SIZE` note below is
 * where the actual weight was dealt with.
 */
function filterScanline(line, previous, bpp) {
  const stride = line.length
  const candidates = []

  for (let type = 0; type <= 4; type++) {
    const out = Buffer.alloc(stride)
    let score = 0
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0
      const b = previous[i]
      const c = i >= bpp ? previous[i - bpp] : 0
      let predicted = 0
      if (type === 1) predicted = a
      else if (type === 2) predicted = b
      else if (type === 3) predicted = (a + b) >> 1
      else if (type === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        predicted = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      const value = (line[i] - predicted) & 0xff
      out[i] = value
      // Read the delta as a signed byte: a small negative delta is as cheap as
      // a small positive one, and treating 0xff as 255 would score it as huge.
      score += value < 128 ? value : 256 - value
    }
    candidates.push({ type, out, score })
  }

  return candidates.reduce((best, c) => (c.score < best.score ? c : best))
}

/** 8-bit RGBA PNG, with a per-row filter chosen by `filterScanline`. */
function encodePng({ width, height, rgba }) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  let previous = Buffer.alloc(stride)

  for (let y = 0; y < height; y++) {
    const line = rgba.subarray(y * stride, (y + 1) * stride)
    const { type, out } = filterScanline(line, previous, 4)
    raw[y * (stride + 1)] = type
    out.copy(raw, y * (stride + 1) + 1)
    previous = line
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// --- outputs -----------------------------------------------------------------

const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

async function main() {
  const response = await fetch(AVATAR_URL)
  if (!response.ok) {
    throw new Error(`${AVATAR_URL} answered ${response.status}`)
  }
  const source = decodePng(Buffer.from(await response.arrayBuffer()))

  // The avatar's ground, read from a corner. Its lighter area is a radial glow
  // behind the monogram, so the corners are the flat part -- which is what a
  // slot has to extend when the art is inset.
  const corner = source.rgba.subarray((2 * source.width + 2) * 4, (2 * source.width + 2) * 4 + 3)
  const ground = [corner[0], corner[1], corner[2]]

  // `inset` is per slot. Full bleed for the favicon and the store icon, 0.66
  // for the Android foreground because anything outside the safe circle is
  // masked away, and smaller again for the splash so the mark is not enormous.
  const slots = [
    ['favicon.png', 64, 1],
    ['icon.png', SLOT_SIZE, 1],
    ['adaptive-icon.png', SLOT_SIZE, 0.66],
    ['splash.png', SLOT_SIZE, 0.4],
  ]

  mkdirSync(ASSET_DIR, { recursive: true })
  console.log(`Source: ${AVATAR_URL} at ${source.width}x${source.height}`)
  console.log(`Ground: ${hex(ground)}`)
  for (const [file, size, inset] of slots) {
    const png = encodePng(tile(size, ground, source, inset))
    writeFileSync(path.join(ASSET_DIR, file), png)
    console.log(
      `  assets/${file.padEnd(18)} ${size}px  inset ${inset}  ${(png.length / 1024).toFixed(1)} KB`,
    )
  }

  // The hero mark. Same source, same derivation rule, different medium.
  const heroPng = encodePng(roundedTile(HERO_MARK_SIZE, source, HERO_MARK_RADIUS))
  const heroPath = path.join(ASSET_DIR, 'hero.svg')
  const hero = readFileSync(heroPath, 'utf8')
  if (!HERO_MARK_BLOCK.test(hero)) {
    throw new Error('assets/hero.svg has no build:org-mark block to write into')
  }
  writeFileSync(
    heroPath,
    hero.replace(
      HERO_MARK_BLOCK,
      `$1\n  <!-- Written by scripts/build-icons.mjs from the org avatar. Do not edit by hand. -->\n` +
        `  <image x="564" y="99" width="72" height="72" href="data:image/png;base64,${heroPng.toString('base64')}"/>\n  $3`,
    ),
  )
  console.log(
    `  assets/hero.svg      ${HERO_MARK_SIZE}px  radius ${HERO_MARK_RADIUS}  ${(heroPng.length / 1024).toFixed(1)} KB embedded`,
  )

  // The two background colours in app.json sit behind these icons, and nothing
  // else keeps them in step with the avatar. Flag a mismatch rather than
  // silently framing a near-black icon in a halo of the wrong colour.
  //
  // The splash colour is read out of the `expo-splash-screen` PLUGIN entry, not
  // from a top-level `splash` key. Expo SDK 57 -- the band this repo pins --
  // dropped that key, so this app.json configures the splash through the plugin
  // the way `ui/example` and `ui-example` do. Reading `expo.splash` here would
  // find nothing and this check would pass by never running.
  const appJson = JSON.parse(readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo

  // A plugin entry is either a bare name or a [name, config] pair. `expo
  // install` writes the bare form, which carries no colour at all, so treat a
  // missing config as a finding rather than as nothing to check.
  const splashPlugin = (appJson.plugins ?? []).find(
    (entry) => entry === 'expo-splash-screen' || entry?.[0] === 'expo-splash-screen',
  )
  const splashColour = Array.isArray(splashPlugin) ? splashPlugin[1]?.backgroundColor : undefined

  const declared = [
    ['android.adaptiveIcon.backgroundColor', appJson.android?.adaptiveIcon?.backgroundColor],
    ['plugins.expo-splash-screen.backgroundColor', splashColour],
  ]

  let drifted = false
  for (const [key, value] of declared) {
    if (value?.toLowerCase() !== hex(ground)) {
      drifted = true
      console.warn(
        `\n  app.json ${key} is ${value ?? 'unset'}, but the avatar's ground is ${hex(ground)}.` +
          `\n  Set it to ${hex(ground)} or the icon sits in a halo of the wrong colour.`,
      )
    }
  }
  if (!drifted) {
    console.log(`\n  app.json agrees with the avatar's ground on both keys.`)
  }
}

await main()
