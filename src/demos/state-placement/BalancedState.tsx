import { useState, useMemo, memo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type DashboardItem } from './types'
import './state-placement-demo.css'

/**
 * BALANCED: State at minimal common ancestor + memo to limit re-render scope.
 *
 * - State (searchQuery, statusFilter, selectedId) lives in Dashboard — minimal level
 *   that needs to share between Filters, List, and Detail.
 * - DetailPanel is memoized: it only re-renders when selectedItem (prop) changes.
 *   When searchQuery changes, Dashboard re-renders, Filters and List re-render,
 *   but Detail (memo) skips because selectedItem is the same reference.
 *
 * Correct state ownership (one place for shared state) + memo to avoid unnecessary
 * re-renders of Detail when only filter state changed.
 */
function FiltersPanelBalanced({
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
  useRenderLog('FiltersPanel (balanced)', { searchQuery, statusFilter })

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
    </div>
  )
}

function ListPanelBalanced({
  items,
  selectedId,
  onSelect,
}: {
  items: DashboardItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('ListPanel (balanced)', { selectedId, itemCount: items.length })

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

const DetailPanelBalanced = memo(function DetailPanelBalanced({
  selectedItem,
}: {
  selectedItem: DashboardItem | null
}) {
  useRenderLog('DetailPanel (balanced, memo)', { selectedId: selectedItem?.id })

  return (
    <div className="placement-panel placement-panel--detail">
      <h3>Detail (memo)</h3>
      {selectedItem ? (
        <p>{selectedItem.name} — {selectedItem.status}</p>
      ) : (
        <p>Select an item</p>
      )}
      <p className="placement-panel__hint">
        Memoized: re-renders only when selectedItem changes. Typing in search does NOT re-render this panel.
      </p>
    </div>
  )
})

export function BalancedState() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('DashboardBalanced', { searchQuery, statusFilter, selectedId })

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
    <section className="placement-dashboard placement-dashboard--correct">
      <header className="placement-dashboard__header">
        <h2>Balanced state ownership</h2>
        <p>
          State at <strong>minimal common ancestor</strong> (Dashboard) so Filters, List, and Detail can share it. <strong>Detail is memoized</strong> — it only re-renders when selectedItem changes. Typing in search re-renders Dashboard, Filters, List — but NOT Detail. Check console: [render] DetailPanel only when selection changes.
        </p>
      </header>
      <div className="placement-dashboard__grid">
        <FiltersPanelBalanced
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />
        <ListPanelBalanced items={filteredItems} selectedId={selectedId} onSelect={setSelectedId} />
        <DetailPanelBalanced selectedItem={selectedItem} />
      </div>
    </section>
  )
}
