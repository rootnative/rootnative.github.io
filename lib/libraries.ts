export interface Library {
  name: string
  icon: string
  description: string
  status: 'alpha' | 'experimental' | 'in the lab'
  meta?: string
  githubUrl: string
  demoUrl?: string
}

export const LIBRARIES: Library[] = [
  {
    name: 'ui',
    icon: 'checkbox-multiple-blank-outline',
    description:
      'Easy-to-customise, easy-to-use UI elements for React Native & Expo — themeable by design.',
    status: 'alpha',
    meta: 'TypeScript · docs & examples available',
    githubUrl: 'https://github.com/rootnative/ui',
    demoUrl: 'https://rootnative.github.io/ui/',
  },
  {
    name: 'inertia',
    icon: 'animation-outline',
    description:
      'A friendly wrapper around Reanimated that makes complex animations feel effortless.',
    status: 'alpha',
    meta: 'powered by react-native-reanimated',
    githubUrl: 'https://github.com/rootnative/inertia',
    demoUrl: 'https://rootnative.github.io/inertia/',
  },
  {
    name: 'game-engine',
    icon: 'gamepad-variant-outline',
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
