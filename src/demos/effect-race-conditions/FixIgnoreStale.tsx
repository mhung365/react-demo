import { useState, useEffect, useRef } from 'react'
import { fetchSearch } from './mockApi'
import { logRequestStart, logRequestEnd } from './requestLog'
import type { SearchResult } from './types'
import './effect-race-conditions-demo.css'

/**
 * FIX 3: Ignore stale responses (cancelled flag). Cleanup sets cancelled = true; in .then we
 * only setState if !cancelled.
 *
 * Same outcome as request-id guard: only the latest response updates state. Difference: we
 * don't track an ID; we only know "this run was superseded" when cleanup ran. Request still
 * runs to completion. Works with any API.
 *
 * Limitation: same as request-id — we don't cancel the network request; we only ignore the result.
 */
export function FixIgnoreStale() {
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

    let cancelled = false
    seqRef.current += 1
    const seq = seqRef.current
    logRequestStart(seq, query)

    setLoading(true)
    fetchSearch(query)
      .then((res) => {
        if (!cancelled) {
          setResults(res.results)
          logRequestEnd(seq, res.query, 'ok', `results=${res.results.length}`)
        } else {
          logRequestEnd(seq, res.query, 'ignored', 'Superseded by newer request')
        }
      })
      .catch((e) => {
        if (!cancelled) logRequestEnd(seq, query, 'error', (e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [query])

  return (
    <section className="race-section race-section--fix">
      <h2>Fix 3: Ignore stale (cancelled flag)</h2>
      <p className="race-section__hint">
        Cleanup sets <code>cancelled = true</code>; in .then we only setState if <code>!cancelled</code>. Older responses log <code>end #N (ignored)</code>. Same as request-id in outcome; no ID tracking. Request still runs to completion.
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
