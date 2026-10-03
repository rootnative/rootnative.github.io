import { useThemeMode } from '@rootnative/core'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'

/**
 * Adds `theme-ready` to `body` once the theme on screen matches the OS scheme.
 * The CSS in app/+html.tsx keeps the light-baked static content hidden from a
 * dark-mode visitor until then. `ThemeProvider` renders light while the client
 * hydrates, so for that visitor the class arrives on the render after it.
 */
export function ThemeReadySignal() {
  const { scheme } = useThemeMode()
  const systemScheme = useColorScheme()

  useEffect(() => {
    if (scheme === systemScheme) {
      document.body.classList.add('theme-ready')
    }
  }, [scheme, systemScheme])

  return null
}
