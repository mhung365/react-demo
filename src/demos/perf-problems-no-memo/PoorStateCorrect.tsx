import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { generateItems } from './types'

const ITEMS = generateItems(50)

/**
 * CORRECT: Colocate state. Sidebar owns sidebarOpen; FilterAndList owns
 * filter and selectedId. No state at root. When filter changes, only
 * FilterAndList (and its children) re-render. When sidebar toggles, only
 * Sidebar re-renders. No memo, no useCallback — simpler and correct.
 */
function SidebarColocated() {
  const [open, setOpen] = useState(false)
  useRenderLog('SidebarColocated (owns open state)')
  return (
    <aside className="perf-dashboard__sidebar">
      <button type="button" onClick={() => setOpen((o) => !o)}>
        {open ? 'Close' : 'Open'} sidebar
      </button>
    </aside>
  )
}

function FilterAndListColocated() {
  const [filter, setFilter] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  useRenderLog('FilterAndListColocated (owns filter + selectedId)')
  const filtered = ITEMS.filter((item) =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  )
  return (
    <div className="perf-dashboard">
      <div className="perf-dashboard__header">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter"
          aria-label="Filter"
        />
      </div>
      <SidebarColocated />
      <div className="perf-dashboard__main">
        {filtered.slice(0, 20).map((item) => (
          <div
            key={item.id}
            className="perf-list-item"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedId(item.id)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedId(item.id)}
            style={{
              background: selectedId === item.id ? '#3b82f6' : undefined,
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PoorStateCorrect() {
  useRenderLog('PoorStateCorrect (root: no state, no memo)')

  return (
    <div className="perf-scenario perf-scenario--correct">
      <div className="perf-scenario__header">
        <h3>3. Correct: colocate state</h3>
        <p>
          Sidebar owns its open state; FilterAndList owns filter and selectedId. Type in filter:
          only FilterAndListColocated re-renders. Toggle sidebar: only SidebarColocated re-renders.
          No memo, no useCallback.
        </p>
      </div>
      <div className="perf-scenario__measure">
        Type in filter or toggle sidebar. Console [render] shows only the component that owns the
        changed state. We fixed the cause (state placement) instead of patching with memo.
      </div>
      <FilterAndListColocated />
      <div className="perf-hint perf-hint--good">
        <strong>Right tool:</strong> Colocating state means only the component that changed
        re-renders. We don’t need memo or useCallback for this. When you find yourself adding memo
        and useCallback everywhere to “fix” re-renders, consider moving state down first.
      </div>
    </div>
  )
}
