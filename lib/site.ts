import { defineSite, type PageMeta } from '@rootnative/seo'

/**
 * The page title is a sentence, not a page name, so the template keeps it as
 * written. The site name still reaches the share card through `og:site_name`.
 */
export const site = defineSite({
  name: 'Root Native',
  url: 'https://rootnative.github.io',
  locale: 'en_US',
  titleTemplate: (title) => title,
})

export const PAGE_TITLE = 'Root Native — libraries that power React Native & Expo apps'

/**
 * The share card and the Organization logo: the org avatar at 460 px, the
 * largest size GitHub serves. The avatar is square, so the Twitter card stays
 * `summary`; `summary_large_image` crops the image to 2:1.
 */
export const SHARE_CARD = {
  image: 'https://avatars.githubusercontent.com/rootnative?size=460',
  imageSize: { width: 460, height: 460 },
  imageAlt: 'Root Native logo',
  twitterCard: 'summary',
} satisfies Pick<PageMeta, 'image' | 'imageSize' | 'imageAlt' | 'twitterCard'>

export const PAGE_DESCRIPTION =
  'Root Native builds open-source libraries that power React Native & Expo apps — UI components, animations without the boilerplate, and a lightweight game engine.'
