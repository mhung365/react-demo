import { useState, useEffect, useRef } from 'react'
import { fetchSearch } from './mockApi'
import { logRequestStart, logRequestEnd } from './requestLog'
import type { SearchResult } from './types'
import './effect-race-conditions-demo.css'

/**
 * FIX 2: Request ID / sequence guard. Each effect run gets an ID; we only setState if our ID
 * is still the "current" one when the response arrives.
 *
 * - currentIdRef is updated in cleanup (or we could set it at start of effect). When effect runs,
 *   we do myId = ++currentIdRef.current (or similar). In .then we check if myId === currentIdRef.current;
 *   if not, a newer request has started → ignore this response.
 *
 * Here we use: at start of effect, myId = ++seqRef; in cleanup we don't change seqRef (so "current"
 * is implicitly "the latest run's id"). Actually the standard pattern is: const requestIdRef = useRef(0);
 * in effect: requestIdRef.current += 1; const myId = requestIdRef.current; ... in .then: if (myId !== requestIdRef.current) { logRequestEnd(..., 'ignored'); return; }. So when a newer effect runs, requestIdRef.current gets a new value; when the old response arrives, myId !== requestIdRef.current so we ignore.
 */
export function FixRequestIdGuard() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    requestIdRef.current += 1
    const myId = requestIdRef.current
    logRequestStart(myId, query)

    setLoading(true)
    fetchSearch(query)
      .then((res) => {
        if (myId !== requestIdRef.current) {
          logRequestEnd(myId, res.query, 'ignored', 'Newer request started')
          return
        }
        setResults(res.results)
        logRequestEnd(myId, res.query, 'ok', `results=${res.results.length}`)
      })
      .catch((e) => {
        if (myId !== requestIdRef.current) return
        logRequestEnd(myId, query, 'error', (e as Error).message)
      })
      .finally(() => {
        if (myId === requestIdRef.current) setLoading(false)
      })

    return () => {}
  }, [query])

  return (
    <section className="race-section race-section--fix">
      <h2>Fix 2: Request ID guard</h2>
      <p className="race-section__hint">
        Each effect run has an ID. When response arrives, we only setState if <code>myId === currentId</code>. Older responses log <code>end #N (ignored)</code>. Request still runs to completion. Works with any API.
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
