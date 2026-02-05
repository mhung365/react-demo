import { useState, useMemo, memo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type DashboardItem } from './types'
import './state-placement-demo.css'

/**
 * REFACTORED CORRECTLY: State at minimal common ancestor (ContentArea), not Dashboard.
 *
 * - Dashboard and Layout don't own or receive state → they don't re-render when search/filter/selection change.
 * - Blast radius: one keystroke → ContentArea, Filters, List re-render (3 components). Detail is memoized so it only re-renders when selectedItem changes.
 * - No prop drilling through Layout: Layout just renders children; ContentArea owns state and renders the panels. Structural fix, not memo everywhere.
 */
type FilterState = 'all' | 'active' | 'archived'

function DashboardRefactored() {
  useRenderLog('Dashboard (refactored)', {})

  return (
    <section className="placement-dashboard placement-dashboard--correct">
      <header className="placement-dashboard__header">
        <h2>Refactored: state at minimal ancestor</h2>
        <p>
          State lives in <strong>ContentArea</strong> (minimal common ancestor of Filters, List, Detail). Dashboard and Layout don&apos;t receive state — they don&apos;t re-render on filter/selection change. One keystroke → only ContentArea, Filters, List re-render (3 components). Detail is memoized. No prop drilling through Layout.
        </p>
      </header>
      <LayoutRefactored>
        <ContentAreaWithState />
      </LayoutRefactored>
    </section>
  )
}

function LayoutRefactored({ children }: { children: React.ReactNode }) {
  useRenderLog('Layout (refactored)', {})

  return (
    <div className="placement-layout">
      <p className="placement-layout__hint placement-layout__hint--correct">
        Layout: no state props. Re-renders only when parent (Dashboard) re-renders — which it doesn&apos;t on filter/selection change.
      </p>
      {children}
    </div>
  )
}

function ContentAreaWithState() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterState>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('ContentArea (refactored, owns state)', { searchQuery, statusFilter, selectedId })

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
    <div className="placement-content-area">
      <p className="placement-content-area__hint placement-content-area__hint--correct">
        ContentArea: owns state. Only this subtree re-renders on filter/selection change.
      </p>
      <div className="placement-dashboard__grid">
        <FiltersPanelRefactored
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />
        <ListPanelRefactored
          items={filteredItems}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <DetailPanelRefactored selectedItem={selectedItem} />
      </div>
    </div>
  )
}

function FiltersPanelRefactored({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: {
  searchQuery: string
  statusFilter: FilterState
  onSearchChange: (v: string) => void
  onStatusChange: (v: FilterState) => void
}) {
  useRenderLog('FiltersPanel (refactored)', { searchQuery, statusFilter })

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
        onChange={(e) => onStatusChange(e.target.value as FilterState)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  )
}

function ListPanelRefactored({
  items,
  selectedId,
  onSelect,
}: {
  items: DashboardItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('ListPanel (refactored)', { selectedId, itemCount: items.length })

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

const DetailPanelRefactored = memo(function DetailPanelRefactored({
  selectedItem,
}: {
  selectedItem: DashboardItem | null
}) {
  useRenderLog('DetailPanel (refactored, memo)', { selectedId: selectedItem?.id })

  return (
    <div className="placement-panel placement-panel--detail">
      <h3>Detail (memo)</h3>
      {selectedItem ? (
        <p>{selectedItem.name} — {selectedItem.status}</p>
      ) : (
        <p>Select an item</p>
      )}
      <p className="placement-panel__hint">
        Memoized; re-renders only when selectedItem changes. Typing in search does not re-render this panel.
      </p>
    </div>
  )
})

export function RefactoredCorrectly() {
  return <DashboardRefactored />
}
