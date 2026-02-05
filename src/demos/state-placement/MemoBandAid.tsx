import { useState, useMemo, memo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type DashboardItem } from './types'
import './state-placement-demo.css'

/**
 * MEMO BAND-AID: Same tree as LiftedTooHighDeep, but we wrap Detail in memo and pass stable selectedItem.
 *
 * - Re-renders: typing in search → Dashboard, Layout, ContentArea, Filters, List re-render (5); Detail skips.
 * - We did NOT fix the architecture: state still at top, Layout and ContentArea still drill 8 props. Adding a new state field still means touching every layer. Memo is a band-aid, not a structural fix.
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

function DashboardLayoutBandAid({
  searchQuery,
  statusFilter,
  selectedId,
  onSearchChange,
  onStatusChange,
  onSelect,
  filteredItems,
  selectedItem,
}: DashboardLayoutProps) {
  useRenderLog('Layout (memo band-aid)', { propCount: 8 })

  return (
    <div className="placement-layout">
      <p className="placement-layout__hint">
        Layout: still forwards 8 props. Still re-renders on every keystroke (memo didn&apos;t help here).
      </p>
      <ContentAreaBandAid
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

function ContentAreaBandAid({
  searchQuery,
  statusFilter,
  selectedId,
  onSearchChange,
  onStatusChange,
  onSelect,
  filteredItems,
  selectedItem,
}: DashboardLayoutProps) {
  useRenderLog('ContentArea (memo band-aid)', { propCount: 8 })

  return (
    <div className="placement-content-area">
      <p className="placement-content-area__hint">
        ContentArea: still drilling. Detail is memoized so it skips — but we didn&apos;t fix the tree.
      </p>
      <div className="placement-dashboard__grid">
        <FiltersPanelBandAid
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
        />
        <ListPanelBandAid items={filteredItems} selectedId={selectedId} onSelect={onSelect} />
        <DetailPanelBandAid selectedItem={selectedItem} />
      </div>
    </div>
  )
}

function FiltersPanelBandAid({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: Pick<DashboardLayoutProps, 'searchQuery' | 'statusFilter' | 'onSearchChange' | 'onStatusChange'>) {
  useRenderLog('FiltersPanel (memo band-aid)', { searchQuery, statusFilter })

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

function ListPanelBandAid({
  items,
  selectedId,
  onSelect,
}: {
  items: DashboardItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('ListPanel (memo band-aid)', { selectedId, itemCount: items.length })

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

const DetailPanelBandAid = memo(function DetailPanelBandAid({
  selectedItem,
}: {
  selectedItem: DashboardItem | null
}) {
  useRenderLog('DetailPanel (memo band-aid, memoized)', { selectedId: selectedItem?.id })

  return (
    <div className="placement-panel placement-panel--detail">
      <h3>Detail (memo)</h3>
      {selectedItem ? (
        <p>{selectedItem.name} — {selectedItem.status}</p>
      ) : (
        <p>Select an item</p>
      )}
      <p className="placement-panel__hint">
        Memo band-aid: this panel skips re-render on search. But Layout/ContentArea still re-render and we still drill 8 props.
      </p>
    </div>
  )
})

export function MemoBandAid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterState>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('Dashboard (memo band-aid)', { searchQuery, statusFilter, selectedId })

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
        <h2>Memo as band-aid</h2>
        <p>
          Same tree, state still at Dashboard. We added <strong>memo(Detail)</strong> so Detail skips re-render on search. But <strong>Layout and ContentArea still re-render</strong> (5 components). Prop drilling unchanged. Adding new state still means touching every layer. Memo fixed a symptom, not the structure.
        </p>
      </header>
      <DashboardLayoutBandAid
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
