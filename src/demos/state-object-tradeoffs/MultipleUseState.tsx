import { useState, useEffect, useRef, memo } from 'react'
import type { FilterState } from './types'
import { useRenderLog } from './useRenderLog'
import './state-object-tradeoffs-demo.css'

/**
 * Child receives ONLY pageSize (primitive). When parent updates search/status/page,
 * pageSize prop is unchanged → this child does NOT re-render (React shallow-compares props).
 */
const PageSizeDisplay = memo(function PageSizeDisplay({ pageSize }: { pageSize: number }) {
  useRenderLog('PageSizeDisplay (receives only pageSize)', { pageSize })
  return (
    <div className="so-panel so-panel--summary">
      <p>Page size: {pageSize}</p>
      <p className="so-hint">This component receives only <code>pageSize</code> → re-renders only when pageSize changes.</p>
    </div>
  )
})

/**
 * Multiple useState: one state per field. Each update only changes one primitive.
 * - Children receiving only one prop (e.g. pageSize) don't re-render when other fields change.
 * - useEffect([search, status, page, pageSize]) runs only when those VALUES change, not on every object replacement.
 */
export function MultipleUseState() {
  useRenderLog('MultipleUseState (parent)')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<FilterState['status']>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const effectRunCount = useRef(0)

  useEffect(() => {
    effectRunCount.current += 1
    console.log(
      `[effect] MultipleUseState — effect ran (count: ${effectRunCount.current}). Deps: [search, status, page, pageSize] → runs only when these values change.`
    )
  }, [search, status, page, pageSize])

  return (
    <section className="so-section so-section--correct">
      <header className="so-section__header">
        <h2>Multiple useState</h2>
        <p>
          One <code>useState</code> per field. Child receives only <code>pageSize</code> (primitive) → re-renders only when pageSize changes. Typing in search does <strong>not</strong> re-render PageSizeDisplay. <code>useEffect([search, status, page, pageSize])</code> runs only when those values change.
        </p>
      </header>
      <div className="so-section__body">
        <div className="so-form">
          <label>Search: <input value={search} onChange={(e) => setSearch(e.target.value)} /></label>
          <label>Status: <select value={status} onChange={(e) => setStatus(e.target.value as FilterState['status'])}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
          <label>Page: <input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} /></label>
          <label>Page size: <input type="number" min={1} max={20} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value) || 1)} /></label>
        </div>
        <PageSizeDisplay pageSize={pageSize} />
      </div>
    </section>
  )
}
