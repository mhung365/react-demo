import { useState, useEffect } from 'react'
import { fetchSearch } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { SearchResult } from './types'
import './request-cancellation-demo.css'

/**
 * CORRECT: Search-as-you-type with AbortController in effect cleanup.
 *
 * - When query changes (or component unmounts), cleanup runs: controller.abort().
 * - Previous in-flight request is aborted; fetchSearch(signal) rejects with AbortError.
 * - We don't setState for aborted requests (catch checks e.name === 'AbortError').
 * - Only the latest request can complete and update state; no stale overwrite.
 *
 * Cleanup also prevents memory leaks: if user navigates away, we abort the request and
 * the .then/.catch won't run setState (aborted → catch, we skip setState for AbortError).
 *
 * Console: [fetch] start for new query; previous request logs end (aborted). Latest request logs end (ok).
 */
export function AbortControllerCorrect() {
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

    const controller = new AbortController()
    const { signal } = controller

    logFetchStart('search (AbortController)', { query })

    setLoading(true)
    setError(null)

    fetchSearch(query, signal)
      .then((res) => {
        setResults(res.results)
        logFetchEnd('search (AbortController)', { query: res.query }, 'ok', `results=${res.results.length}`)
      })
      .catch((e) => {
        if (e?.name === 'AbortError') {
          logFetchEnd('search (AbortController)', { query }, 'aborted', 'Request cancelled in cleanup')
          return
        }
        setError(e instanceof Error ? e : new Error(String(e)))
        logFetchEnd('search (AbortController)', { query }, 'error', (e as Error).message)
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      console.log('[fetch] cleanup — search (query changed or unmount), aborting previous request')
    }
  }, [query])

  return (
    <section className="request-cancel-section request-cancel-section--correct">
      <h2>Correct: AbortController in cleanup</h2>
      <p className="request-cancel-section__hint">
        Type quickly: previous request is <strong>aborted</strong> (network request cancelled).
        Only the latest query&apos;s response updates state. Cleanup prevents setState after unmount.
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
