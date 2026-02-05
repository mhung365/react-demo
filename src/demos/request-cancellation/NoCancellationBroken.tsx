import { useState, useEffect } from 'react'
import { fetchSearch } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { SearchResult } from './types'
import './request-cancellation-demo.css'

/**
 * BROKEN: Search-as-you-type with NO request cancellation.
 *
 * - User types "a" → request A (delay ~650ms). Then "ab" → request B (~500ms). Then "abc" → request C (~350ms).
 * - Without cancellation, all three requests stay in flight. Whichever finishes LAST wins.
 * - If A finishes last (e.g. network variance), UI shows results for "a" while user typed "abc" = STALE DATA.
 *
 * Console: [fetch] start/end for each request; order of "end" shows which request overwrote (may be older).
 * Also: no cleanup → if user navigates away before request completes, setState on unmounted component = memory leak warning.
 */
export function NoCancellationBroken() {
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

    logFetchStart('search (no cancel)', { query })

    setLoading(true)
    setError(null)

    fetchSearch(query)
      .then((res) => {
        setResults(res.results)
        logFetchEnd('search (no cancel)', { query: res.query }, 'ok', `results=${res.results.length}`)
      })
      .catch((e) => {
        setError(e instanceof Error ? e : new Error(String(e)))
        const outcome = e?.name === 'AbortError' ? 'aborted' : 'error'
        logFetchEnd('search (no cancel)', { query }, outcome, (e as Error).message)
      })
      .finally(() => setLoading(false))
  }, [query])

  return (
    <section className="request-cancel-section request-cancel-section--broken">
      <h2>Broken: no cancellation (race + possible leak)</h2>
      <p className="request-cancel-section__hint">
        Type quickly: e.g. <code>a</code> → <code>ab</code> → <code>abc</code>. Shorter queries are faster (delay scales with length).
        Whichever request finishes <strong>last</strong> overwrites — can be an older query. No cleanup → setState after unmount possible.
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
