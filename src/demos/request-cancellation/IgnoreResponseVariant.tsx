import { useState, useEffect } from 'react'
import { fetchSearch } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { SearchResult } from './types'
import './request-cancellation-demo.css'

/**
 * ALTERNATIVE: Ignore outdated responses (cancelled flag) instead of aborting the request.
 *
 * - When query changes, cleanup sets cancelled = true. In-flight .then/.catch check !cancelled before setState.
 * - The previous request still runs to completion on the server/network; we just ignore its response.
 * - Prevents stale overwrite and setState-after-unmount (cleanup), but does NOT cancel the network request.
 *
 * Contrast: AbortController actually cancels the request (fetch throws, mock rejects). "Ignore" only discards the result when it arrives.
 */
export function IgnoreResponseVariant() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    logFetchStart('search (ignore response)', { query })

    setLoading(true)
    setError(null)

    fetchSearch(query)
      .then((res) => {
        if (!cancelled) {
          setResults(res.results)
          logFetchEnd('search (ignore response)', { query: res.query }, 'ok', `results=${res.results.length}`)
        } else {
          logFetchEnd('search (ignore response)', { query: res.query }, 'ok', '(ignored: superseded)')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          logFetchEnd('search (ignore response)', { query }, 'error', (e as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      console.log('[fetch] cleanup — search (ignore response: will ignore in-flight result)')
    }
  }, [query])

  return (
    <section className="request-cancel-section request-cancel-section--variant">
      <h2>Alternative: ignore response (cancelled flag)</h2>
      <p className="request-cancel-section__hint">
        Same UX as AbortController: only latest query updates state. Request still runs to completion; we ignore the result when it arrives. No network cancellation.
      </p>
      <div className="request-cancel-section__controls">
        <label>
          Search
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search…"
            autoComplete="off"
          />
        </label>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="request-cancel-section__error">{error.message}</p>}
      {!loading && !error && query && (
        <>
          <p className="request-cancel-section__meta">Results for &quot;{query}&quot; ({results.length})</p>
          <ul className="request-cancel-section__list">
            {results.map((r) => (
              <li key={r.id}>{r.name} — {r.category}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
