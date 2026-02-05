import { useState, useEffect, useRef } from 'react'
import type { FilterState } from './types'
import { DEFAULT_FILTER } from './types'
import { useRenderLog } from './useRenderLog'
import './state-object-tradeoffs-demo.css'

/**
 * Child receives the whole state object. Every setState in parent creates a NEW object
 * reference, so this child re-renders whenever ANY field changes (search, status, page, pageSize).
 */
function FilterSummarySingle({ filter }: { filter: FilterState }) {
  useRenderLog('FilterSummarySingle (receives whole object)', {
    search: filter.search,
    pageSize: filter.pageSize,
  })
  return (
    <div className="so-panel so-panel--summary">
      <p>Summary: search=&quot;{filter.search}&quot;, status={filter.status}, page={filter.page}, pageSize={filter.pageSize}</p>
      <p className="so-hint">This component receives the whole state object → re-renders on every keystroke/change.</p>
    </div>
  )
}

/**
 * Single state object: all filter fields in one useState.
 * - Updating any field replaces the whole object → new reference every time.
 * - Children that receive "state" get new reference → re-render even if they only use one field.
 * - useEffect([state]) runs every time because state reference changes every update.
 */
export function SingleStateObject() {
  useRenderLog('SingleStateObject (parent)')
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const effectRunCount = useRef(0)

  useEffect(() => {
    effectRunCount.current += 1
    console.log(
      `[effect] SingleStateObject — effect ran (count: ${effectRunCount.current}). Deps: [filter] → new object every update, so effect runs every time.`
    )
  }, [filter])

  return (
    <section className="so-section so-section--wrong">
      <header className="so-section__header">
        <h2>Single state object</h2>
        <p>
          All fields in one <code>useState(&#123; filter &#125;)</code>. Updating any field with <code>setFilter(prev =&gt; (&#123; ...prev, search: value &#125;))</code> creates a <strong>new object reference</strong>. Child receiving <code>filter</code> re-renders every time. <code>useEffect([filter])</code> runs on every update because <code>filter</code> is a new reference each time.
        </p>
      </header>
      <div className="so-section__body">
        <div className="so-form">
          <label>Search: <input value={filter.search} onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))} /></label>
          <label>Status: <select value={filter.status} onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value as FilterState['status'] }))}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
          <label>Page: <input type="number" min={1} value={filter.page} onChange={(e) => setFilter((prev) => ({ ...prev, page: Number(e.target.value) || 1 }))} /></label>
          <label>Page size: <input type="number" min={1} max={20} value={filter.pageSize} onChange={(e) => setFilter((prev) => ({ ...prev, pageSize: Number(e.target.value) || 1 }))} /></label>
        </div>
        <FilterSummarySingle filter={filter} />
      </div>
    </section>
  )
}
