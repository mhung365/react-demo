import { useState, useEffect } from 'react'
import { fetchDashboard } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { DashboardItem, DashboardFilters } from './types'
import './data-fetching-demo.css'

/**
 * BROKEN: Stale params — dependency array omits 'search' (or we use stale closure).
 *
 * Effect runs when `status` changes but uses `search` from closure. If user types
 * in search and then changes status, we fetch with OLD search. Or: empty deps []
 * so we never refetch when filters change = always stale.
 *
 * Here we use [] so we only fetch once; filters in UI are ignored after mount = stale.
 */
export function StaleParamsFetch() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const filters: DashboardFilters = { status, search }
    logFetchStart('dashboard (stale params)', filters)

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchDashboard(filters)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items)
          logFetchEnd('dashboard (stale params)', res.requestedFor, true, `items=${res.items.length}`)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          logFetchEnd('dashboard (stale params)', filters, false, (e as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
    // BUG: Empty deps. We only fetch once with initial status/search. Changing filters does nothing.
  }, [])

  return (
    <section className="data-fetch-section data-fetch-section--broken">
      <h2>Broken: stale params (empty deps)</h2>
      <p className="data-fetch-section__hint">
        Effect has <code>[]</code> deps — runs once on mount. Change status or search: no refetch; UI shows data for initial filters only.
      </p>
      <div className="data-fetch-section__controls">
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DashboardFilters['status'])}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          Search
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name"
          />
        </label>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="data-fetch-section__error">{error.message}</p>}
      {!loading && !error && (
        <>
          <p className="data-fetch-section__meta">Fetched once for initial filters. Current UI filters may not match. ({items.length} items)</p>
          <ul className="data-fetch-section__list">
            {items.map((item) => (
              <li key={item.id}>{item.name} — {item.status}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
