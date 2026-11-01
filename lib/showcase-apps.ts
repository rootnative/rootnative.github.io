/// <reference types="expo/types" />
// The reference declares `require.context`. An Expo app gets it from the
// generated `expo-env.d.ts`, which this repository does not keep.
import { LIBRARIES } from './libraries'
import type { ShowcaseEntry, ShowcasePackage } from './showcase'

export interface ShowcaseApp extends ShowcaseEntry {
  /** The file name of the entry, with no extension. */
  slug: string
}

/** One library that an app is built with, as the card shows it. */
export interface BuiltWith {
  name: string
  /** A brand mark URL. A library with no mark shows its `icon`. */
  mark?: string
  icon: string
}

/** Where a developer reads how to add an app. */
export const ADD_APP_URL = 'https://github.com/rootnative/rootnative.github.io/tree/main/showcase'

/**
 * The name of the library that each package belongs to. `seo` is a package of
 * the `ui` repository, but it has no card of its own on the home page, so it
 * shows on its own. The `Record` makes a new `ShowcasePackage` a type error
 * here until it has a library.
 */
const LIBRARY_OF: Record<ShowcasePackage, string> = {
  '@rootnative/cli': 'ui',
  '@rootnative/components': 'ui',
  '@rootnative/core': 'ui',
  '@rootnative/icons': 'ui',
  '@rootnative/seo': 'seo',
  '@rootnative/inertia': 'inertia',
  '@rootnative/impulse': 'impulse',
  '@rootnative/devhub': 'devhub',
}

const SEO: BuiltWith = { name: 'seo', icon: 'magnify' }

/** The libraries of an app, one per library, in the order of the home page. */
export function builtWith(packages: ShowcasePackage[]): BuiltWith[] {
  const names = new Set(packages.map((name) => LIBRARY_OF[name]))
  const libraries: BuiltWith[] = LIBRARIES.filter((library) => names.has(library.name)).map(
    ({ name, mark, icon }) => ({ name, mark, icon }),
  )
  return names.has(SEO.name) ? [...libraries, SEO] : libraries
}

/**
 * Every `showcase/<slug>.ts`, newest first. Metro reads the folder at bundle
 * time, so an app is one new file and no list in the code names it. The
 * pattern skips a file that starts with `_`, such as the template.
 *
 * The order must not depend on the locale or the clock: the static export
 * renders the page on the server, and the client must render the same order.
 */
const entries = require.context('../showcase', false, /^\.\/[a-z0-9-]+\.ts$/)

export const SHOWCASE_APPS: ShowcaseApp[] = entries
  .keys()
  .map((key) => ({
    ...(entries(key) as { default: ShowcaseEntry }).default,
    slug: key.slice('./'.length, -'.ts'.length),
  }))
  .sort((a, b) => (a.added === b.added ? (a.name < b.name ? -1 : 1) : a.added < b.added ? 1 : -1))
