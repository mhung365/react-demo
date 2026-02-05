import { useState, useMemo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type DashboardItem } from './types'
import './state-placement-demo.css'

/**
 * LIFTED TOO HIGH + DEEP TREE: State at Dashboard, passed through Layout and ContentArea.
 *
 * - Blast radius: one keystroke → Dashboard, Layout, ContentArea, Filters, List, Detail all re-render (6 components).
 * - Prop drilling: Layout and ContentArea don't use the state; they only forward it. Brittle: long prop lists, every intermediate must be updated when we add state.
 */
type FilterState = 'all' | 'active' | 'archived'

interface DashboardLayoutProps {
  searchQuery: string
  statusFilter: FilterState
  selectedId: string | null
  onSearchChange: (v: string) => void
  onStatusChange: (v: FilterState) => void
  onSelect: (id: string) => void
  filteredItems: DashboardItem[]
  selectedItem: DashboardItem | null
}

function DashboardLayout({
  searchQuery,
  statusFilter,
  selectedId,
  onSearchChange,
  onStatusChange,
  onSelect,
  filteredItems,
  selectedItem,
}: DashboardLayoutProps) {
  useRenderLog('Layout (lifted deep)', { propCount: 8 })

  return (
    <div className="placement-layout">
      <p className="placement-layout__hint">
        Layout: does not use state — only forwards 8 props (prop drilling). Re-renders on every keystroke.
      </p>
      <ContentArea
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        selectedId={selectedId}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onSelect={onSelect}
        filteredItems={filteredItems}
        selectedItem={selectedItem}
      />
    </div>
  )
}

function ContentArea({
  searchQuery,
  statusFilter,
  selectedId,
  onSearchChange,
  onStatusChange,
  onSelect,
  filteredItems,
  selectedItem,
}: DashboardLayoutProps) {
  useRenderLog('ContentArea (lifted deep)', { propCount: 8 })

  return (
    <div className="placement-content-area">
      <p className="placement-content-area__hint">
        ContentArea: same 8 props forwarded again. Re-renders on every keystroke.
      </p>
      <div className="placement-dashboard__grid">
        <FiltersPanelDeep
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
        />
        <ListPanelDeep items={filteredItems} selectedId={selectedId} onSelect={onSelect} />
        <DetailPanelDeep selectedItem={selectedItem} />
      </div>
    </div>
  )
}

function FiltersPanelDeep({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: Pick<DashboardLayoutProps, 'searchQuery' | 'statusFilter' | 'onSearchChange' | 'onStatusChange'>) {
  useRenderLog('FiltersPanel (lifted deep)', { searchQuery, statusFilter })

  return (
    <div className="placement-panel placement-panel--filters">
      <h3>Filters</h3>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search (type to see blast radius)"
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

function ListPanelDeep({
  items,
  selectedId,
  onSelect,
}: {
  items: DashboardItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('ListPanel (lifted deep)', { selectedId, itemCount: items.length })

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

function DetailPanelDeep({ selectedItem }: { selectedItem: DashboardItem | null }) {
  useRenderLog('DetailPanel (lifted deep)', { selectedId: selectedItem?.id })

  return (
    <div className="placement-panel placement-panel--detail">
      <h3>Detail</h3>
      {selectedItem ? (
        <p>{selectedItem.name} — {selectedItem.status}</p>
      ) : (
        <p>Select an item</p>
      )}
      <p className="placement-panel__hint placement-panel__hint--wrong">
        Re-renders on every keystroke (unnecessary).
      </p>
    </div>
  )
}

export function LiftedTooHighDeep() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterState>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('Dashboard (lifted deep)', { searchQuery, statusFilter, selectedId })

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
        <h2>Lifted too high (deep tree + prop drilling)</h2>
        <p>
          State lives in <strong>Dashboard</strong>. Layout and ContentArea don&apos;t use it — they only <strong>forward 8 props</strong> (prop drilling). One keystroke → <strong>6 components re-render</strong>. Check console: [render] for Dashboard, Layout, ContentArea, Filters, List, Detail.
        </p>
      </header>
      <DashboardLayout
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        selectedId={selectedId}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSelect={setSelectedId}
        filteredItems={filteredItems}
        selectedItem={selectedItem}
      />
    </section>
  )
}
