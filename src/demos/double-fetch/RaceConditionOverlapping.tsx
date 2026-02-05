import { useState, useEffect } from 'react'
import { fetchList } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { ListItem, ListFilters } from './types'
import './double-fetch-demo.css'

/**
 * RACE CONDITION: Overlapping fetches, no cancellation.
 *
 * User changes filter quickly (e.g. All → Active). "All" is slow (600ms), "Active" fast (250ms).
 * Request for Active finishes first; we set state. Then request for All finishes and overwrites
 * → UI shows "All" data while user selected "Active" (wrong).
 *
 * Console: [fetch] start for All, start for Active; end for Active; end for All (overwrites).
 * Fix: cancellation in cleanup (see FixedUnstableDeps or data-fetching-use-effect demo).
 */
export function RaceConditionOverlapping() {
  const [status, setStatus] = useState<ListFilters['status']>('all')
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const filters: ListFilters = { status, search: '' }
    logFetchStart('list (race, no cancel)', filters)

    setLoading(true)
    fetchList(filters)
      .then((res) => {
        setItems(res.items)
        logFetchEnd('list (race, no cancel)', res.requestedFor, true, `items=${res.items.length} — may overwrite newer request!`)
      })
      .catch((e) => {
        logFetchEnd('list (race, no cancel)', filters, false, (e as Error).message)
      })
      .finally(() => setLoading(false))
  }, [status])

  return (
    <section className="double-fetch-section double-fetch-section--broken">
      <h2>Race: overlapping fetches (no cancellation)</h2>
      <p className="double-fetch-section__hint">
        Change status quickly: <strong>All → Active</strong>. &quot;All&quot; is slow (600ms), &quot;Active&quot; fast (250ms).
        Active finishes first; then All finishes and overwrites → wrong data. Console shows order of <code>[fetch] end</code>.
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
      </div>
      {loading && <p>Loading…</p>}
      {!loading && (
        <>
          <p className="double-fetch-section__meta">Showing for: {status} ({items.length} items)</p>
          <ul className="double-fetch-section__list">
            {items.map((item) => (
              <li key={item.id}>{item.name} — {item.status}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
