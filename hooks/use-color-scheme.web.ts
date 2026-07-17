import { useEffect, useState } from 'react'
import { useColorScheme as useSystemColorScheme } from 'react-native'

/**
 * Static rendering always produces the light theme, so the first client
 * render must match it — otherwise React hydration silently keeps the
 * server's light classes. Switch to the real scheme after mount.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  const scheme = useSystemColorScheme()
  return hasHydrated ? scheme : 'light'
}
