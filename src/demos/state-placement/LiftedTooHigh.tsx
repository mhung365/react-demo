import { useState, useMemo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type DashboardItem } from './types'
import './state-placement-demo.css'

/**
 * STATE LIFTED TOO HIGH: All shared state lives in one top-level component.
 *
 * When searchQuery (or any state) changes, the entire dashboard re-renders:
 * DashboardLiftedHigh → FiltersPanel → ListPanel → DetailPanel all re-render.
 *
 * Lifting state up causes unnecessary re-renders: DetailPanel re-renders on every
 * keystroke in the search input even though Detail only needs selectedId/selectedItem.
 * Check console: [render] DetailPanel on every search change.
 */
function FiltersPanelLifted({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: {
  searchQuery: string
  statusFilter: 'all' | 'active' | 'archived'
  onSearchChange: (v: string) => void
  onStatusChange: (v: 'all' | 'active' | 'archived') => void
}) {
  useRenderLog('FiltersPanel (lifted)', { searchQuery, statusFilter })

  return (
    <div className="placement-panel placement-panel--filters">
      <h3>Filters</h3>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'archived')}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <p className="placement-panel__hint">Typing here re-renders List and Detail (state lifted high).</p>
    </div>
  )
}

function ListPanelLifted({
  items,
  selectedId,
  onSelect,
}: {
  items: DashboardItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('ListPanel (lifted)', { selectedId, itemCount: items.length })

  return (
    <div className="placement-panel placement-panel--list">
      <h3>List</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className={selectedId === item.id ? 'selected' : ''}
            onClick={() => onSelect(item.id)}
          >
            {item.name} ({item.status})
          </li>
        ))}
      </ul>
    </div>
  )
}

function DetailPanelLifted({ selectedItem }: { selectedItem: DashboardItem | null }) {
  useRenderLog('DetailPanel (lifted)', { selectedId: selectedItem?.id })

  return (
    <div className="placement-panel placement-panel--detail">
      <h3>Detail</h3>
      {selectedItem ? (
        <p>{selectedItem.name} — {selectedItem.status}</p>
      ) : (
        <p>Select an item</p>
      )}
      <p className="placement-panel__hint placement-panel__hint--wrong">
        This panel re-renders on every keystroke in search (unnecessary — only selectedItem matters).
      </p>
    </div>
  )
}

export function LiftedTooHigh() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('DashboardLiftedHigh', { searchQuery, statusFilter, selectedId })

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [searchQuery, statusFilter])

  const selectedItem = useMemo(
    () => MOCK_ITEMS.find((i) => i.id === selectedId) ?? null,
    [selectedId]
  )

  return (
    <section className="placement-dashboard placement-dashboard--wrong">
      <header className="placement-dashboard__header">
        <h2>State lifted too high (anti-pattern)</h2>
        <p>
          All state (searchQuery, statusFilter, selectedId) lives in one top-level dashboard. When you type in search, <strong>Dashboard, Filters, List, and Detail all re-render</strong>. Detail re-rendering on every keystroke is unnecessary — it only needs selectedItem. Check console: [render] DetailPanel on every search change.
        </p>
      </header>
      <div className="placement-dashboard__grid">
        <FiltersPanelLifted
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />
        <ListPanelLifted items={filteredItems} selectedId={selectedId} onSelect={setSelectedId} />
        <DetailPanelLifted selectedItem={selectedItem} />
      </div>
    </section>
  )
}
