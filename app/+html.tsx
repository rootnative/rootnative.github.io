import { entranceGuardCss, entranceGuardNoscriptCss } from '@rootnative/inertia/static-export'
import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

// Keep in sync with lib/theme.ts (createMaterialTheme('#60A5FA', { variant: 'vibrant' })).
const LIGHT_BACKGROUND = '#f8f9ff'
const DARK_BACKGROUND = '#0e141c'

/**
 * Static rendering bakes the light theme into the HTML, so dark-mode visitors
 * would see a light page until the bundle hydrates and re-renders. This shell
 * paints the correct background before any JS runs and keeps the light-baked
 * content hidden for dark-mode visitors until the client applies the real
 * theme (`theme-ready`, added by hooks/use-color-scheme.web.ts). If the bundle
 * never runs, the animation fallback reveals the content after 4s.
 *
 * The page also animates itself in with @rootnative/inertia, so the export
 * bakes `opacity: 0` into every element that waits for an entrance. The
 * library's own guard covers those — see `entranceGuardCss` below. This block
 * covers the theme only.
 */
const themeGuardCss = `
:root {
  color-scheme: light dark;
  background-color: ${LIGHT_BACKGROUND};
}
@media (prefers-color-scheme: dark) {
  :root {
    background-color: ${DARK_BACKGROUND};
  }
  body:not(.theme-ready) {
    visibility: hidden;
    animation: theme-guard-timeout 0s 4s forwards;
  }
  @keyframes theme-guard-timeout {
    to { visibility: visible; }
  }
}
`

/**
 * No script at all, so the client never adds `theme-ready`. Reveal the page at
 * once instead of holding the visitor for the 4s fallback.
 * `entranceGuardNoscriptCss` does the same for the entrance values.
 */
const noscriptCss = `
body { visibility: visible !important; }
`

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: themeGuardCss }} />
        <style dangerouslySetInnerHTML={{ __html: entranceGuardCss() }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: noscriptCss }} />
          <style dangerouslySetInnerHTML={{ __html: entranceGuardNoscriptCss }} />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  )
}
