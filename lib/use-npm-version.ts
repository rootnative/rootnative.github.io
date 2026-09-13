import { useEffect, useState } from 'react'

/** Cache versions across mounts so we hit the registry once per package. */
const cache = new Map<string, string>()

interface NpmVersion {
  version: string | undefined
  /** False only while an in-flight fetch is still pending. */
  ready: boolean
}

/**
 * Fetches the latest published version of an npm package from the registry.
 * `ready` is false only while a request is in flight; once settled it is true
 * whether the package resolved, is unpublished, or the request failed —
 * letting cards hold their pills until the data is known.
 */
export function useNpmVersion(npmPackage?: string): NpmVersion {
  const [state, setState] = useState<NpmVersion>(() => {
    if (!npmPackage) {
      return { version: undefined, ready: true }
    }
    const cached = cache.get(npmPackage)
    return { version: cached, ready: cached !== undefined }
  })

  useEffect(() => {
    // The `useState` initialiser covers the first mount. These two writes exist
    // for a LATER `npmPackage` change, where the answer is already known and no
    // request is made — so the card must not be left on the previous package's
    // pills. Neither write cascades: both are terminal.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!npmPackage) {
      setState({ version: undefined, ready: true })
      return
    }
    if (cache.has(npmPackage)) {
      setState({ version: cache.get(npmPackage), ready: true })
      return
    }

    let cancelled = false
    setState({ version: undefined, ready: false })
    /* eslint-enable react-hooks/set-state-in-effect */
    const url = `https://registry.npmjs.org/${npmPackage}/latest`

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { version?: string } | null) => {
        const resolved = data?.version
        if (resolved) {
          cache.set(npmPackage, resolved)
        }
        if (!cancelled) {
          setState({ version: resolved, ready: true })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ version: undefined, ready: true })
        }
      })

    return () => {
      cancelled = true
    }
  }, [npmPackage])

  return state
}
