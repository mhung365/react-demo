import { useState } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type DashboardItem } from './types'
import './state-placement-demo.css'

/**
 * STATE COLOCATED TOO LOW: Each panel owns its own state; nothing is shared.
 *
 * - FiltersPanel: has searchQuery, statusFilter (local). List doesn't receive them — we CAN'T filter the list.
 * - ListPanel: has items, selectedId (local). Detail doesn't receive selectedId — we CAN'T show selected item in detail.
 *
 * Colocating state here prevents feature growth: "filter list by search" and "show selected in detail" require state to be shared (lifted to a common ancestor).
 */
function FiltersPanelColocated() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  useRenderLog('FiltersPanel (colocated)', { searchQuery, statusFilter })

  return (
    <div className="placement-panel placement-panel--filters">
      <h3>Filters (state colocated here)</h3>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search (does not filter list — state not shared)"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <p className="placement-panel__hint">List does not receive these — cannot filter list.</p>
    </div>
  )
}

function ListPanelColocated() {
  const [items] = useState<DashboardItem[]>(MOCK_ITEMS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('ListPanel (colocated)', { selectedId })

  return (
    <div className="placement-panel placement-panel--list">
      <h3>List (state colocated here)</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className={selectedId === item.id ? 'selected' : ''}
            onClick={() => setSelectedId(item.id)}
          >
            {item.name} ({item.status})
          </li>
        ))}
      </ul>
      <p className="placement-panel__hint">Detail does not receive selectedId — cannot show selected.</p>
    </div>
  )
}

function DetailPanelColocated() {
  useRenderLog('DetailPanel (colocated)')
  return (
    <div className="placement-panel placement-panel--detail">
      <h3>Detail</h3>
      <p>Select an item (parent has no selectedId — state colocated in List).</p>
    </div>
  )
}

export function ColocatedTooLow() {
  useRenderLog('DashboardColocatedLow')

  return (
    <section className="placement-dashboard placement-dashboard--wrong">
      <header className="placement-dashboard__header">
        <h2>State colocated too low</h2>
        <p>
          Filters has searchQuery/statusFilter (local). List has items/selectedId (local). Detail has nothing. We <strong>cannot</strong> filter the list by search (List doesn&apos;t receive filter state) or show selected item in detail (Detail doesn&apos;t receive selectedId). Colocating here prevents feature growth.
        </p>
      </header>
      <div className="placement-dashboard__grid">
        <FiltersPanelColocated />
        <ListPanelColocated />
        <DetailPanelColocated />
      </div>
    </section>
  )
}
