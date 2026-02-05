import { useState, useEffect } from 'react'
import { fetchDashboard } from './mockApi'
import type { DashboardFilters, DashboardItem } from './types'
import './avoid-use-effect-demo.css'

/**
 * BAD: Data fetching in useEffect when filters change.
 *
 * - Manual loading/error state, no cache, no deduplication, no built-in cancellation (unless you add it).
 * - Every filter change: effect runs, fetch, setState. At scale you duplicate this pattern everywhere.
 * - Server state (API data) belongs in a data layer (e.g. React Query), not in useState + useEffect.
 */
export function DataFetchInEffect() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const filters: DashboardFilters = { status, search }
    fetchDashboard(filters)
      .then((res) => {
        if (!cancelled) setItems(res.items)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [status, search])

  return (
    <section className="avoid-section avoid-section--bad">
      <h2>Before: Data fetch in useEffect</h2>
      <p className="avoid-section__hint">
        Manual fetch, loading, error, no cache. Server state in useState + useEffect is repetitive and error-prone. Use a data layer (e.g. React Query) instead.
      </p>
      <div className="avoid-section__controls">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as DashboardFilters['status'])}>
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
            placeholder="Search"
          />
        </label>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="avoid-section__error">{error.message}</p>}
      {!loading && !error && (
        <ul className="avoid-section__list">
          {items.map((item) => (
            <li key={item.id}>{item.name} ({item.status})</li>
          ))}
        </ul>
      )}
    </section>
  )
}
