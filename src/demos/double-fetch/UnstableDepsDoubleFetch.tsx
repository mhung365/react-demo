import { useState, useEffect } from 'react'
import { fetchList } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { ListItem, ListFilters } from './types'
import './double-fetch-demo.css'

/**
 * GENUINE DOUBLE FETCH BUG: unstable effect dependencies.
 *
 * Effect depends on [filters] where filters = { status, search } (object literal).
 * Every render creates a NEW object reference → React sees "deps changed" → effect runs every render.
 * So we get: render 1 → effect → fetch 1; render 2 (e.g. parent) → effect → fetch 2; etc.
 *
 * This is a REAL bug (happens in production too). Fix: use primitive deps [status, search]
 * so the effect only runs when status or search actually change. See FixedUnstableDeps.
 */
export function UnstableDepsDoubleFetch() {
  const [status, setStatus] = useState<ListFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(false)

  // BUG: New object every render → new reference → effect runs every time.
  const filters: ListFilters = { status, search }

  useEffect(() => {
    logFetchStart('list (unstable deps)', filters)

    setLoading(true)
    fetchList(filters)
      .then((res) => {
        setItems(res.items)
        logFetchEnd('list (unstable deps)', res.requestedFor, true, `items=${res.items.length}`)
      })
      .catch((e) => {
        logFetchEnd('list (unstable deps)', filters, false, (e as Error).message)
      })
      .finally(() => setLoading(false))
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps -- BUG: filters is new every render

  return (
    <section className="double-fetch-section double-fetch-section--broken">
      <h2>Genuine bug: unstable deps (object in deps)</h2>
      <p className="double-fetch-section__hint">
        Effect deps: <code>[filters]</code> where <code>filters = &#123; status, search &#125;</code>.
        New object every render → effect runs every render → multiple fetches. Check console for repeated <code>[fetch] start</code>.
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
