import { useState, useEffect, useRef } from 'react'
import { fetchSearch } from './mockApi'
import { logRequestStart, logRequestEnd } from './requestLog'
import type { SearchResult } from './types'
import './effect-race-conditions-demo.css'

/**
 * FIX 1: AbortController in cleanup. Previous request is cancelled when query changes.
 *
 * - Effect creates controller, passes signal to fetchSearch. Cleanup calls controller.abort().
 * - Out-of-order responses are impossible: only the latest request can complete (older ones
 *   reject with AbortError). We don't setState for AbortError.
 *
 * Limitation: API must support AbortSignal. Request is actually cancelled (network/server).
 */
export function FixAbortController() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const seqRef = useRef(0)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const { signal } = controller
    seqRef.current += 1
    const seq = seqRef.current
    logRequestStart(seq, query)

    setLoading(true)
    fetchSearch(query, signal)
      .then((res) => {
        setResults(res.results)
        logRequestEnd(seq, res.query, 'ok', `results=${res.results.length}`)
      })
      .catch((e) => {
        if (e?.name === 'AbortError') {
          logRequestEnd(seq, query, 'aborted', 'Cancelled in cleanup')
          return
        }
        logRequestEnd(seq, query, 'error', (e as Error).message)
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [query])

  return (
    <section className="race-section race-section--fix">
      <h2>Fix 1: AbortController</h2>
      <p className="race-section__hint">
        Cleanup aborts previous request. Only the latest request can complete. Console: older requests log <code>end #N (aborted)</code>. Limitation: API must support signal.
      </p>
      <div className="race-section__controls">
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
      {!loading && query && (
        <>
          <p className="race-section__meta">Results for &quot;{query}&quot; ({results.length})</p>
          <ul className="race-section__list">
            {results.map((r) => (
              <li key={r.id}>{r.name} — {r.category}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
