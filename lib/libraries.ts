import { MARK_GAME_ENGINE, MARK_IMPULSE, MARK_INERTIA, MARK_UI } from './brand-marks'

export type LibraryStatus = 'in the lab' | 'experimental' | 'alpha' | 'beta' | 'stable'

export interface Library {
  name: string
  /** Material icon, used only when the library has no brand mark of its own. */
  icon: string
  /**
   * URL of the library's own brand mark, read from its repository at view time.
   * A mark carries its own brand colours, so a card that has one shows it on a
   * plain surface instead of inside the themed icon badge.
   */
  mark?: string
  description: string
  /** Fallback shown until the npm version resolves; live status is derived from that version. */
  status: LibraryStatus
  /** npm package whose latest published version is shown on the card. */
  npmPackage?: string
  meta?: string
  githubUrl: string
  demoUrl?: string
}

/**
 * Maps a published npm version to a release status.
 * A prerelease tag wins (`-alpha`/`-beta`/`-rc`); otherwise 0.x is
 * experimental and >=1.0.0 is stable. `undefined` means unpublished.
 */
export function statusFromVersion(version: string | undefined): LibraryStatus {
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
  const major = Number(version.split('.')[0])
  return major >= 1 ? 'stable' : 'experimental'
}

export const LIBRARIES: Library[] = [
  {
    name: 'ui',
    icon: 'checkbox-multiple-blank-outline',
    mark: MARK_UI,
    description:
      'Easy-to-customise, easy-to-use UI elements for React Native & Expo — themeable by design.',
    status: 'alpha',
    npmPackage: '@rootnative/components',
    meta: 'TypeScript · docs & examples available',
    githubUrl: 'https://github.com/rootnative/ui',
    demoUrl: 'https://rootnative.github.io/ui/',
  },
  {
    name: 'inertia',
    icon: 'animation-outline',
    mark: MARK_INERTIA,
    description:
      'A friendly wrapper around Reanimated that makes complex animations feel effortless.',
    status: 'alpha',
    npmPackage: '@rootnative/inertia',
    meta: 'powered by react-native-reanimated',
    githubUrl: 'https://github.com/rootnative/inertia',
    demoUrl: 'https://rootnative.github.io/inertia/',
  },
  {
    name: 'impulse',
    icon: 'gesture-tap',
    mark: MARK_IMPULSE,
    description:
      'Declarative gesture primitives — a gesture is written as an intent, not assembled from a builder chain.',
    status: 'in the lab',
    meta: 'powered by react-native-gesture-handler',
    githubUrl: 'https://github.com/rootnative/impulse',
  },
  {
    name: 'game-engine',
    icon: 'gamepad-variant-outline',
    mark: MARK_GAME_ENGINE,
    description:
      'A lightweight game engine for React Native — build playful, interactive experiences with familiar tools.',
    status: 'experimental',
    meta: 'TypeScript',
    githubUrl: 'https://github.com/rootnative/game-engine',
  },
  {
    name: "what's next",
    icon: 'flask-outline',
    description:
      'More building blocks are brewing — small, focused libraries designed to work great together.',
    status: 'in the lab',
    meta: 'watch the org to be first to know',
    githubUrl: 'https://github.com/orgs/rootnative/repositories',
  },
]

export const LINKS = {
  org: 'https://github.com/rootnative',
  uiDocs: 'https://rootnative.github.io/ui/',
  examples: 'https://github.com/rootnative/ui-example',
  repositories: 'https://github.com/orgs/rootnative/repositories',
}
