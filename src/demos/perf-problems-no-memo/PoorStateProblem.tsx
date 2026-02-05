import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { generateItems } from './types'

const ITEMS = generateItems(50)

/**
 * PROBLEM: Poor state architecture — all state at top.
 * filter, sidebarOpen, and selectedId live in one parent. Any change
 * (typing, toggling sidebar, selecting an item) re-renders the entire
 * tree: Filter, Sidebar, and List all re-render. Memo can band-aid this
 * with stable callbacks, but the right fix is to colocate state so only
 * the component that owns the state re-renders.
 */
function FilterSection({
  filter,
  onFilterChange,
}: {
  filter: string
  onFilterChange: (v: string) => void
}) {
  useRenderLog('FilterSection (problem: re-renders on any parent state change)')
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
}

function Sidebar({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  useRenderLog('Sidebar (problem: re-renders on any parent state change)')
  return (
    <aside className="perf-dashboard__sidebar">
      <button type="button" onClick={onToggle}>
        {open ? 'Close' : 'Open'} sidebar
      </button>
    </aside>
  )
}

function MainList({
  filter,
  selectedId,
  onSelect,
}: {
  filter: string
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  useRenderLog('MainList (problem: re-renders on any parent state change)')
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
}

export function PoorStateProblem() {
  const [filter, setFilter] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  useRenderLog('PoorStateProblem (root: holds all state)')

  return (
    <div className="perf-scenario perf-scenario--problem">
      <div className="perf-scenario__header">
        <h3>3. Problem: poor state architecture</h3>
        <p>
          filter, sidebarOpen, and selectedId all live in the root. Any change re-renders Filter,
          Sidebar, and MainList. Check console [render] — type, toggle sidebar, or select an item;
          all three components re-render every time.
        </p>
      </div>
      <div className="perf-scenario__measure perf-scenario__measure--bad">
        Type in filter, toggle sidebar, or click an item. Console shows [render] for FilterSection,
        Sidebar, and MainList on every action. Memo can reduce re-renders if we add stable
        callbacks, but the right fix is to colocate state.
      </div>
      <div className="perf-dashboard">
        <FilterSection filter={filter} onFilterChange={setFilter} />
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
        <MainList filter={filter} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="perf-hint perf-hint--bad">
        <strong>Why memo is a band-aid:</strong> We could wrap Sidebar and MainList in React.memo
        and pass useCallback for onToggle and onSelect. That would reduce re-renders when only
        filter changes. But we’d need to maintain stable deps everywhere. The right fix: colocate —
        put filter state in FilterSection, sidebar state in Sidebar, selection in MainList (or a
        small parent). Then only the component that changed re-renders, without memo.
      </div>
    </div>
  )
}
