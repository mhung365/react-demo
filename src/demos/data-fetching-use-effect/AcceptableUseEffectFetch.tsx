import { useState, useEffect } from 'react'
import { fetchUserProfile } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { UserProfile } from './types'
import './data-fetching-demo.css'

/**
 * ACCEPTABLE: Fetch once on mount, no dependencies that change.
 *
 * - Single fire: user profile (or app config) loaded once when component mounts.
 * - Proper cleanup: cancelled flag so in-flight request does not set state after unmount.
 * - No filter/params: nothing in dependency array that would cause refetch or stale params.
 *
 * When useEffect fetch is acceptable: one-off load (profile, config), stable deps, cleanup.
 * Console: [fetch] start — user profile, then [fetch] end (ok) — user profile.
 */
export function AcceptableUseEffectFetch() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const params = { once: 'mount' }
    logFetchStart('user profile', params)

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchUserProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          logFetchEnd('user profile', params, true, `name=${data.name}`)
        } else {
          logFetchEnd('user profile', params, true, '(ignored: unmounted)')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          logFetchEnd('user profile', params, false, (e as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      console.log('[fetch] cleanup — user profile (component unmount)')
    }
  }, []) // Empty deps = run once on mount. No stale params.

  return (
    <section className="data-fetch-section data-fetch-section--acceptable">
      <h2>Acceptable: fetch once on mount (useEffect)</h2>
      <p className="data-fetch-section__hint">
        One-off load (e.g. user profile). Empty deps, proper cleanup. Check console for [fetch] start/end.
      </p>
      {loading && <p>Loading profile…</p>}
      {error && <p className="data-fetch-section__error">{error.message}</p>}
      {profile && !loading && !error && (
        <p>
          <strong>{profile.name}</strong> — {profile.role}
        </p>
      )}
    </section>
  )
}
