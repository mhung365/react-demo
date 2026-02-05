import { useState, useEffect, useRef } from 'react'
import { fetchSearch } from './mockApi'
import { logRequestStart, logRequestEnd } from './requestLog'
import type { SearchResult } from './types'
import './effect-race-conditions-demo.css'

/**
 * BROKEN: Correct dependency array [query], but NO mitigation for overlapping requests.
 *
 * - User types "a" → effect runs, request #1 (query=a). User types "ab" → effect runs, request #2 (query=ab).
 * - Dependencies are correct: we refetch when query changes. But both requests are in flight.
 * - Whichever response arrives LAST wins. Shorter query has shorter delay (see mockApi), so often "ab"
 *   finishes before "a" — then "a" finishes and overwrites state with stale data. UI shows "a" while
 *   user typed "ab".
 *
 * Correct deps do NOT prevent race conditions. They only ensure we start the right requests; they
 * don't ensure we ignore or cancel outdated ones.
 *
 * Console: [request] start #1 (a), start #2 (ab); end #2 (ab), end #1 (a) → overwrite with a.
 */
export function RaceCorrectDepsBroken() {
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

    seqRef.current += 1
    const seq = seqRef.current
    logRequestStart(seq, query)

    setLoading(true)
    fetchSearch(query)
      .then((res) => {
        setResults(res.results)
        logRequestEnd(seq, res.query, 'ok', `results=${res.results.length} — may overwrite newer!`)
      })
      .catch((e) => {
        logRequestEnd(seq, query, 'error', (e as Error).message)
      })
      .finally(() => setLoading(false))
  }, [query]) // Correct deps. Still race: no cancellation or guard.

  return (
    <section className="race-section race-section--broken">
      <h2>Broken: correct deps, no mitigation (race)</h2>
      <p className="race-section__hint">
        Dependencies are correct (<code>[query]</code>). Type quickly: <code>a</code> → <code>ab</code> → <code>abc</code>.
        Shorter query = faster response. Whichever response arrives <strong>last</strong> overwrites — often the older query. Console: request start/end order vs response order.
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
