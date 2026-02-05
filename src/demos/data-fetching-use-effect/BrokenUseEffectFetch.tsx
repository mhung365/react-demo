import { useState, useEffect } from 'react'
import { fetchDashboard } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { DashboardItem, DashboardFilters } from './types'
import './data-fetching-demo.css'

/**
 * BROKEN: Fetch when filters change, but NO request cancellation.
 *
 * - Variable delay: "all" = 700ms, "active"/"archived" = 300ms (see mockApi).
 * - If user switches quickly (e.g. All → Active), "Active" finishes first; then "All" finishes
 *   and overwrites state = STALE DATA (UI shows "All" but user selected "Active").
 * - Console: [fetch] start/end for each request; you'll see "end" for an older request after a newer one.
 *
 * Also illustrates: double fetch in Strict Mode (mount, unmount, mount) = two requests if no cleanup.
 */
export function BrokenUseEffectFetch() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const filters: DashboardFilters = { status, search }
    logFetchStart('dashboard', filters)

    setLoading(true)
    setError(null)

    // BUG: No cancelled flag. When status/search change, previous request is not abandoned.
    // Whichever response arrives last wins — can be an older request (race condition).
    fetchDashboard(filters)
      .then((res) => {
        setItems(res.items)
        logFetchEnd('dashboard', res.requestedFor, true, `items=${res.items.length}`)
      })
      .catch((e) => {
        setError(e instanceof Error ? e : new Error(String(e)))
        logFetchEnd('dashboard', filters, false, (e as Error).message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [status, search])

  return (
    <section className="data-fetch-section data-fetch-section--broken">
      <h2>Broken: race condition (no cancellation)</h2>
      <p className="data-fetch-section__hint">
        Change status quickly: e.g. All → Active. &quot;All&quot; is slow (700ms), &quot;Active&quot; fast (300ms).
        Active finishes first, then All overwrites = wrong data. Console shows [fetch] start/end order.
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
          <p className="data-fetch-section__meta">Showing for status: {status} ({items.length} items)</p>
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
