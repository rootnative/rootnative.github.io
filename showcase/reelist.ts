import type { ShowcaseEntry } from '../lib/showcase'

const FILES = 'https://raw.githubusercontent.com/raajnadar/reelist/main/assets'

export default {
  name: 'Reelist',
  tagline: 'Browse films, watch trailers, and keep a watchlist.',
  author: 'raajnadar',
  packages: ['@rootnative/components', '@rootnative/core', '@rootnative/inertia'],
  platforms: ['ios', 'android', 'web'],
  links: {
    source: 'https://github.com/raajnadar/reelist',
    web: 'https://reelist.raajnadar.in/',
    expoGo: 'exp://u.expo.dev/7fe1b9fe-fa75-406c-aaf9-ae330957fc46?channel-name=main',
  },
  icon: `${FILES}/icon.png`,
  screenshots: [
    {
      url: `${FILES}/docs/screenshots/phone-home-light.jpg`,
      darkUrl: `${FILES}/docs/screenshots/phone-home-dark.jpg`,
      alt: 'The home screen on a phone, with the trending carousel',
    },
    {
      url: `${FILES}/docs/screenshots/phone-film-light.jpg`,
      darkUrl: `${FILES}/docs/screenshots/phone-film-dark.jpg`,
      alt: 'The film page of Dune: Part Two on a phone, in the colours of its poster',
    },
    {
      url: `${FILES}/docs/screenshots/phone-watchlist-light.jpg`,
      darkUrl: `${FILES}/docs/screenshots/phone-watchlist-dark.jpg`,
      alt: 'The watchlist on a phone: 2 of 8 films watched',
    },
  ],
  added: '2026-11-01',
} satisfies ShowcaseEntry
