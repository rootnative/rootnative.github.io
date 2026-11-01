/** A published `@rootnative/*` package that an app can name in its entry. */
export type ShowcasePackage =
  | '@rootnative/cli'
  | '@rootnative/components'
  | '@rootnative/core'
  | '@rootnative/devhub'
  | '@rootnative/icons'
  | '@rootnative/impulse'
  | '@rootnative/inertia'
  | '@rootnative/seo'

export type ShowcasePlatform = 'ios' | 'android' | 'web'

export interface ShowcaseScreenshot {
  /** URL of a JPEG, PNG or WebP file. */
  url: string
  /** URL of the same screen in dark mode. A visitor who uses dark mode sees this file. */
  darkUrl?: string
  /** What the screenshot shows, for a screen reader. */
  alt: string
}

/** The entry needs at least one link. */
export interface ShowcaseLinks {
  source?: string
  web?: string
  /** A page on `apps.apple.com`. */
  appStore?: string
  /** A page on `play.google.com`. */
  playStore?: string
  /** An `exp://` link that opens the app in Expo Go. */
  expoGo?: string
}

/**
 * One app in the showcase: the default export of `showcase/<slug>.ts`.
 *
 * Each image is a URL that the site reads at view time, so a new file at the
 * same URL shows on the site with no change here. An image URL is on
 * `raw.githubusercontent.com` or on the host of `links.web`.
 * `scripts/check-showcase.mjs` checks the rules that this type cannot hold.
 */
export interface ShowcaseEntry {
  /** 30 characters or fewer. */
  name: string
  /** One sentence, 90 characters or fewer. */
  tagline: string
  /** The GitHub user or organisation that owns the app. */
  author: string
  /** The `@rootnative/*` packages in the `package.json` of the app. */
  packages: [ShowcasePackage, ...ShowcasePackage[]]
  platforms: [ShowcasePlatform, ...ShowcasePlatform[]]
  links: ShowcaseLinks
  /** URL of a square PNG, JPEG or WebP file, from 256 to 1024 px wide. */
  icon: string
  /** One to four. */
  screenshots: [ShowcaseScreenshot, ...ShowcaseScreenshot[]]
  /** The day the app joined the showcase, as `YYYY-MM-DD`. The newest app shows first. */
  added: string
}
