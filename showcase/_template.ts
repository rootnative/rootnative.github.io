// Copy this file to showcase/<your-app>.ts, and replace each value.
// README.md in this folder gives the rules.
import type { ShowcaseEntry } from '../lib/showcase'

export default {
  name: 'Your app',
  tagline: 'One sentence that says what the app does.',
  author: 'your-github-user-name',
  packages: ['@rootnative/components', '@rootnative/core'],
  platforms: ['ios', 'android'],
  links: {
    source: 'https://github.com/your-github-user-name/your-app',
  },
  icon: 'https://raw.githubusercontent.com/your-github-user-name/your-app/main/assets/icon.png',
  screenshots: [
    {
      url: 'https://raw.githubusercontent.com/your-github-user-name/your-app/main/docs/home.png',
      alt: 'The home screen, with the list of items',
    },
  ],
  added: '2026-01-01',
} satisfies ShowcaseEntry
