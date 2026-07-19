import { useEffect, useState } from 'react'

/**
 * Static export pre-renders at width 0 (compact), and production React
 * adopts the server DOM without patching mismatched styles — so any
 * breakpoint-dependent value must render its compact variant first and
 * only switch to the measured breakpoint after hydration.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}
