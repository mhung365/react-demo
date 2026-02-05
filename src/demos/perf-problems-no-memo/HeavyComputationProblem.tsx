import { useState } from 'react'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { generateItems } from './types'

const ITEMS = generateItems(8000)

/**
 * PROBLEM: Heavy computation inside render.
 * Every keystroke runs filter over 8000 items synchronously during render.
 * Memoization cannot fix this: the component that does the work re-renders
 * on every keystroke (new state), and the expensive work is in the same
 * component as the state. React.memo on a child would not skip the parent.
 */
function FilteredList({ keyword }: { keyword: string }) {
  // This runs on EVERY render — i.e. every keystroke. No cache.
  const filtered = ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      String(item.value).includes(keyword)
  )
  useMeasureRender('FilteredList (heavy filter in render)')
  return (
    <div className="perf-list-container">
      {filtered.slice(0, 100).map((item) => (
        <div key={item.id} className="perf-list-item">
          {item.name} — {item.value}
        </div>
      ))}
      {filtered.length > 100 && (
        <div className="perf-list-item" style={{ color: '#a1a1aa' }}>
          … and {filtered.length - 100} more
        </div>
      )}
    </div>
  )
}

export function HeavyComputationProblem() {
  const [keyword, setKeyword] = useState('')

  return (
    <div className="perf-scenario perf-scenario--problem">
      <div className="perf-scenario__header">
        <h3>1. Problem: heavy computation in render</h3>
        <p>
          Filter runs over 8000 items on every keystroke, inside render. Input and list block together.
        </p>
      </div>
      <div className="perf-scenario__measure perf-scenario__measure--bad">
        Type in the input. Check console for [measure] FilteredList — you’ll see high ms on every
        keystroke. Memo won’t help: the component that owns the state is the one doing the work.
      </div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Filter (e.g. 10 or A)"
        aria-label="Filter list"
      />
      <FilteredList keyword={keyword} />
      <div className="perf-hint perf-hint--bad">
        <strong>Why memo fails:</strong> React.memo on FilteredList would still re-render because
        the parent passes new <code>keyword</code> every time. The bottleneck is the work inside
        render, not “too many children re-rendering”. Fix: move work off the critical path
        (useDeferredValue or useMemo for the derived list and keep input responsive).
      </div>
    </div>
  )
}
