import { useState, useEffect, useRef, useMemo, memo } from 'react'
import type { FilterState } from './types'
import { DEFAULT_FILTER } from './types'
import { useRenderLog } from './useRenderLog'
import './state-object-tradeoffs-demo.css'

/**
 * Receives only the fields it needs. Re-renders only when search or status change.
 */
const SearchStatusSummary = memo(function SearchStatusSummary({
  search,
  status,
}: {
  search: string
  status: FilterState['status']
}) {
  useRenderLog('SearchStatusSummary (search, status only)')
  return (
    <div className="so-panel so-panel--summary">
      <p>Search=&quot;{search}&quot;, status={status}</p>
    </div>
  )
})

/**
 * Receives only page/pageSize. Re-renders only when pagination changes.
 */
const PaginationSummary = memo(function PaginationSummary({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  useRenderLog('PaginationSummary (page, pageSize only)')
  return (
    <div className="so-panel so-panel--summary">
      <p>Page {page}, size {pageSize}</p>
    </div>
  )
})

/**
 * Refactored: multiple useState + useMemo when we need a single object (e.g. for API or reset).
 * - Effect deps are explicit primitives.
 * - Children receive only the props they need → minimal re-renders.
 * - When we need "the whole filter" (e.g. submit, persist), we derive it with useMemo so we don't replace object on every parent render.
 */
export function RefactoredClear() {
  useRenderLog('RefactoredClear (parent)')
  const [search, setSearch] = useState(DEFAULT_FILTER.search)
  const [status, setStatus] = useState<FilterState['status']>(DEFAULT_FILTER.status)
  const [page, setPage] = useState(DEFAULT_FILTER.page)
  const [pageSize, setPageSize] = useState(DEFAULT_FILTER.pageSize)
  const effectRunCount = useRef(0)

  const filterAsObject = useMemo<FilterState>(
    () => ({ search, status, page, pageSize }),
    [search, status, page, pageSize]
  )

  useEffect(() => {
    effectRunCount.current += 1
    console.log(
      `[effect] RefactoredClear — effect ran (count: ${effectRunCount.current}). Deps: primitives only.`
    )
  }, [search, status, page, pageSize])

  const handleReset = () => {
    setSearch(DEFAULT_FILTER.search)
    setStatus(DEFAULT_FILTER.status)
    setPage(DEFAULT_FILTER.page)
    setPageSize(DEFAULT_FILTER.pageSize)
  }

  return (
    <section className="so-section so-section--refactored">
      <header className="so-section__header">
        <h2>Refactored: clear state structure</h2>
        <p>
          Multiple <code>useState</code>; children receive only the props they need. <code>filterAsObject</code> from <code>useMemo</code> when we need one object (e.g. API call or reset). Effect deps are explicit primitives.
        </p>
      </header>
      <div className="so-section__body">
        <div className="so-form">
          <label>Search: <input value={search} onChange={(e) => setSearch(e.target.value)} /></label>
          <label>Status: <select value={status} onChange={(e) => setStatus(e.target.value as FilterState['status'])}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
          <label>Page: <input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} /></label>
          <label>Page size: <input type="number" min={1} max={20} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value) || 1)} /></label>
          <button type="button" onClick={handleReset}>Reset to defaults</button>
        </div>
        <SearchStatusSummary search={search} status={status} />
        <PaginationSummary page={page} pageSize={pageSize} />
        <p className="so-hint">Derived object for API: <code>filterAsObject</code> = useMemo(&#123; search, status, page, pageSize &#125;, [search, status, page, pageSize]). Same reference until a value changes.</p>
      </div>
    </section>
  )
}
