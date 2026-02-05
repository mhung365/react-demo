import { useState, useEffect } from 'react'
import { fetchItems } from './mockApi'
import type { DashboardItem, FilterParams } from './types'
import './state-classification-demo.css'

/**
 * WRONG: Server data treated as client/global state.
 *
 * - Server state (API items) stored in useState and fetched in useEffect. No cache — every mount refetches. No shared cache between components; navigating away and back triggers another fetch. Stale time, refetch on window focus, etc. are ad hoc or missing.
 * - UI state (modal open, active tab, search input) and client state (page size preference) mixed with "list data" in the same component or passed together. No clear ownership.
 * - Bugs: (1) No cache — same filter refetched on every visit. (2) Loading/error state is local; if we lifted "items" to Context, we'd have one global loading that blocks the whole app or we duplicate loading per screen. (3) Server data in useState means we're responsible for invalidation, refetch, dedup — we don't do it, so stale or redundant fetches.
 */

export function WrongImplementation() {
  const [items, setItems] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterParams['status']>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'filters'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchItems({ search, status: statusFilter, page, pageSize })
      .then((res) => {
        setItems(res.items)
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [search, statusFilter, page, pageSize])

  return (
    <section className="state-class state-class--wrong">
      <header className="state-class__section-header">
        <h2>Wrong: server data as client state</h2>
        <p>
          <strong>Server state</strong> (API items) in <code>useState</code> + <code>useEffect</code>. No cache — every mount refetches; no shared cache; no staleTime/refetch strategy. <strong>UI state</strong> (modal, tabs, search, page) and <strong>client state</strong> (pageSize as preference) mixed in same component. Bugs: redundant fetches on navigate back; you own loading/error/invalidation manually; server data not treated as cacheable.
        </p>
      </header>
      <div className="state-class__layout">
        <div className="state-class__tabs">
          <button
            type="button"
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            List
          </button>
          <button
            type="button"
            className={activeTab === 'filters' ? 'active' : ''}
            onClick={() => setActiveTab('filters')}
          >
            Filters
          </button>
        </div>
        {activeTab === 'filters' && (
          <div className="state-class__block">
            <label>Search: <input value={search} onChange={(e) => setSearch(e.target.value)} /></label>
            <label>Status: <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FilterParams['status'])}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
            <label>Page size (client pref): <input type="number" min={1} max={10} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} /></label>
          </div>
        )}
        {activeTab === 'list' && (
          <div className="state-class__block">
            {loading && <p>Loading… (no cache — refetches every time)</p>}
            {error && <p className="state-class__error">Error: {error.message}</p>}
            {!loading && !error && (
              <>
                <ul className="state-class__list">
                  {items.map((item) => (
                    <li key={item.id} onClick={() => { setSelectedId(item.id); setModalOpen(true); }}>
                      {item.name} — {item.status}
                    </li>
                  ))}
                </ul>
                <div className="state-class__pagination">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                  <span>Page {page}</span>
                  <button type="button" onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {modalOpen && (
        <div className="state-class__modal" role="dialog" aria-modal="true">
          <div>
            <p>Detail for {selectedId ?? '—'} (UI state: modal)</p>
            <button type="button" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </section>
  )
}
