import { useState, useEffect } from 'react'
import { fetchList } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { ListItem, ListFilters } from './types'
import './double-fetch-demo.css'

/**
 * FIX: Primitive deps [status, search] + cancellation.
 *
 * Effect runs only when status or search actually change (same primitives → same reference).
 * Cleanup sets cancelled so in-flight requests from a previous run are ignored.
 * No double fetch from dependency churn; safe with StrictMode and in production.
 */
export function FixedUnstableDeps() {
  const [status, setStatus] = useState<ListFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const filters: ListFilters = { status, search }
    logFetchStart('list (fixed deps)', filters)

    let cancelled = false
    setLoading(true)

    fetchList(filters)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items)
          logFetchEnd('list (fixed deps)', res.requestedFor, true, `items=${res.items.length}`)
        } else {
          logFetchEnd('list (fixed deps)', res.requestedFor, true, '(ignored: superseded)')
        }
      })
      .catch((e) => {
        if (!cancelled) logFetchEnd('list (fixed deps)', filters, false, (e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [status, search]) // Primitives: effect runs only when these change

  return (
    <section className="double-fetch-section double-fetch-section--fixed">
      <h2>Fixed: primitive deps + cancellation</h2>
      <p className="double-fetch-section__hint">
        Deps: <code>[status, search]</code>. Effect runs only when status or search change. Cleanup ignores in-flight responses. One fetch per filter change.
      </p>
      <div className="double-fetch-section__controls">
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ListFilters['status'])}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          Search <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && (
        <ul className="double-fetch-section__list">
          {items.map((item) => (
            <li key={item.id}>{item.name} — {item.status}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
