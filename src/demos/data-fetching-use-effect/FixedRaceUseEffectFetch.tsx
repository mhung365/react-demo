import { useState, useEffect } from 'react'
import { fetchDashboard } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { DashboardItem, DashboardFilters } from './types'
import './data-fetching-demo.css'

/**
 * FIXED: Same filter-driven fetch as BrokenUseEffectFetch, but with request cancellation.
 *
 * - cancelled flag: when status/search change, cleanup sets cancelled = true; in-flight
 *   response is ignored, so older request cannot overwrite newer state.
 * - Correct deps: [status, search] so we refetch when filters change.
 *
 * This is the "minimal fix" if you keep useEffect: always cancel in cleanup and use correct deps.
 * For filter-driven server data, React Query (see RefactoredFetch) is still the better choice.
 */
export function FixedRaceUseEffectFetch() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const filters: DashboardFilters = { status, search }
    logFetchStart('dashboard (fixed race)', filters)

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchDashboard(filters)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items)
          logFetchEnd('dashboard (fixed race)', res.requestedFor, true, `items=${res.items.length}`)
        } else {
          logFetchEnd('dashboard (fixed race)', res.requestedFor, true, '(ignored: superseded)')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          logFetchEnd('dashboard (fixed race)', filters, false, (e as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      console.log('[fetch] cleanup — dashboard (filters changed or unmount)')
    }
  }, [status, search])

  return (
    <section className="data-fetch-section data-fetch-section--fixed">
      <h2>Fixed: cancellation + correct deps</h2>
      <p className="data-fetch-section__hint">
        Same as broken but with <code>cancelled</code> flag and cleanup. Change status quickly: only the latest request updates state. Console: older responses log &quot;(ignored: superseded)&quot;.
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
