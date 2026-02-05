import { useState, memo, useCallback } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { generateItems } from './types'

const ITEMS = generateItems(50)

/**
 * TRY MEMO: We add React.memo to FilterSection, Sidebar, and MainList,
 * and useCallback for all handlers. When only sidebarOpen changes,
 * FilterSection and MainList skip (they get same props). When only filter
 * changes, Sidebar skips. So we reduce some re-renders, but we pay with
 * useCallback deps and more complex code. The right fix is colocate state.
 */
const FilterSection = memo(function FilterSection({
  filter,
  onFilterChange,
}: {
  filter: string
  onFilterChange: (v: string) => void
}) {
  useRenderLog('FilterSection (memo: skips when only sidebar/selection change)')
  return (
    <div className="perf-dashboard__header">
      <input
        type="text"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Filter"
        aria-label="Filter"
      />
    </div>
  )
})

const Sidebar = memo(function Sidebar({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  useRenderLog('Sidebar (memo: skips when only filter/selection change)')
  return (
    <aside className="perf-dashboard__sidebar">
      <button type="button" onClick={onToggle}>
        {open ? 'Close' : 'Open'} sidebar
      </button>
    </aside>
  )
})

const MainList = memo(function MainList({
  filter,
  selectedId,
  onSelect,
}: {
  filter: string
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  useRenderLog('MainList (memo: skips when only sidebar change)')
  const filtered = ITEMS.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  )
  return (
    <div className="perf-dashboard__main">
      {filtered.slice(0, 20).map((item) => (
        <div
          key={item.id}
          className="perf-list-item"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(item.id)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(item.id)}
          style={{
            background: selectedId === item.id ? '#3b82f6' : undefined,
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
})

export function PoorStateTryMemo() {
  const [filter, setFilter] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  useRenderLog('PoorStateTryMemo (root: holds all state + useCallback)')

  const onFilterChange = useCallback((v: string) => setFilter(v), [])
  const onToggle = useCallback(() => setSidebarOpen((o) => !o), [])
  const onSelect = useCallback((id: number) => setSelectedId(id), [])

  return (
    <div className="perf-scenario perf-scenario--try-memo">
      <div className="perf-scenario__header">
        <h3>3. Try memo: memo + useCallback</h3>
        <p>
          Same state at top; we wrap FilterSection, Sidebar, MainList in React.memo and pass
          useCallback for handlers. Toggle sidebar: only root and Sidebar re-render (FilterSection
          and MainList skip). Type in filter: root, FilterSection, MainList re-render (Sidebar
          skips). So we reduce some re-renders but add complexity; the right fix is colocate.
        </p>
      </div>
      <div className="perf-scenario__measure">
        Toggle sidebar and check console: FilterSection and MainList should not log [render]. Type
        in filter: Sidebar should not log. Memo helps here but is a band-aid; colocate state to fix
        the cause.
      </div>
      <div className="perf-dashboard">
        <FilterSection filter={filter} onFilterChange={onFilterChange} />
        <Sidebar open={sidebarOpen} onToggle={onToggle} />
        <MainList filter={filter} selectedId={selectedId} onSelect={onSelect} />
      </div>
      <div className="perf-hint perf-hint--bad">
        <strong>Memo is a band-aid:</strong> We now maintain useCallback for every handler and
        memo on every child. If we add a new state or prop, we must remember to add useCallback or
        memo breaks. The right fix: colocate state so only the component that owns the state
        re-renders; then we don’t need memo for this.
      </div>
    </div>
  )
}
