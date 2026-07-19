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

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: themeGuardCss }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: 'body { visibility: visible !important; }' }} />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  )
}
