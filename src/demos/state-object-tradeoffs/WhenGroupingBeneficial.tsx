import { useState, useRef } from 'react'
import type { FilterState } from './types'
import { DEFAULT_FILTER } from './types'
import { useRenderLog } from './useRenderLog'
import './state-object-tradeoffs-demo.css'

/**
 * When grouping IS beneficial:
 * - We need to reset the entire form in one shot (single setState with full object).
 * - We need to pass the whole filter to one consumer (e.g. "submit" or "persist") and that consumer uses all fields.
 * - We don't pass the object to children that only need a subset (to avoid unnecessary re-renders).
 *
 * Here we use ONE state object but we're careful:
 * - The only child receives the whole object and uses all of it (display for submit preview).
 * - Reset is one setState(DEFAULT_FILTER) — clean and atomic.
 * - Trade-off: if we added a child that only needs pageSize, it would re-render on every change. So "when beneficial" = when you have no such children, or when atomic reset/serialization is the main use.
 */
export function WhenGroupingBeneficial() {
  useRenderLog('WhenGroupingBeneficial (parent)')
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const submitCount = useRef(0)

  const handleReset = () => {
    setFilter(DEFAULT_FILTER)
  }

  const handleSubmit = () => {
    submitCount.current += 1
    console.log(
      `[submit] WhenGroupingBeneficial — submitted filter (count: ${submitCount.current}):`,
      JSON.stringify(filter)
    )
  }

  return (
    <section className="so-section so-section--beneficial">
      <header className="so-section__header">
        <h2>When grouping state is beneficial</h2>
        <p>
          One object is justified when: (1) <strong>Reset</strong> — one <code>setFilter(DEFAULT_FILTER)</code> is atomic. (2) <strong>Submit / persist</strong> — you need the whole filter as one object for API or localStorage. (3) The only consumer of the object uses <strong>all</strong> fields (e.g. submit preview). Avoid passing the object to children that only need one field — they would re-render on every change.
        </p>
      </header>
      <div className="so-section__body">
        <div className="so-form">
          <label>Search: <input value={filter.search} onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))} /></label>
          <label>Status: <select value={filter.status} onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value as FilterState['status'] }))}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
          <label>Page: <input type="number" min={1} value={filter.page} onChange={(e) => setFilter((prev) => ({ ...prev, page: Number(e.target.value) || 1 }))} /></label>
          <label>Page size: <input type="number" min={1} max={20} value={filter.pageSize} onChange={(e) => setFilter((prev) => ({ ...prev, pageSize: Number(e.target.value) || 1 }))} /></label>
          <button type="button" onClick={handleReset}>Reset (one setState)</button>
          <button type="button" onClick={handleSubmit}>Submit filter (whole object)</button>
        </div>
        <div className="so-panel so-panel--summary">
          <p><strong>Submit preview</strong> (uses whole filter): search=&quot;{filter.search}&quot;, status={filter.status}, page={filter.page}, pageSize={filter.pageSize}</p>
          <p className="so-hint">This panel uses all fields → receiving the whole object is fine. Adding a child that only needs pageSize would re-render on every keystroke — then prefer multiple useState and pass only pageSize.</p>
        </div>
      </div>
    </section>
  )
}
