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
    // The one legitimate setState-in-effect: flipping off a server-rendered
    // value after mount. The static export bakes the light theme, so the first
    // client render has to match it or React keeps the server's DOM. This
    // commit is the signal that hydration is done. See CLAUDE.md, rule 1.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true)
  }, [])

  // Runs after the commit that rendered the real scheme, so app/+html.tsx can
  // keep the light-baked static content hidden for dark-mode visitors until
  // the correct theme is actually in the DOM.
  useEffect(() => {
    if (hasHydrated) {
      document.body.classList.add('theme-ready')
    }
  }, [hasHydrated])

  const scheme = useSystemColorScheme()
  return hasHydrated ? scheme : 'light'
}
