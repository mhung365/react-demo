import { useState, useDeferredValue, useMemo } from 'react'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { generateItems } from './types'

const ITEMS = generateItems(8000)

/**
 * CORRECT: useDeferredValue(keyword) so the list can show a deferred value.
 * Input updates immediately (fast path); the heavy filter runs with deferredKeyword
 * and can be interrupted. We also use useMemo so we only recompute when
 * deferredKeyword changes, and we don't block the input render.
 */
function FilteredListDeferred({ deferredKeyword }: { deferredKeyword: string }) {
  const filtered = useMemo(
    () =>
      ITEMS.filter(
        (item) =>
          item.name.toLowerCase().includes(deferredKeyword.toLowerCase()) ||
          String(item.value).includes(deferredKeyword)
      ),
    [deferredKeyword]
  )
  useMeasureRender('FilteredListDeferred (deferred + useMemo)')
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

export function HeavyComputationCorrect() {
  const [keyword, setKeyword] = useState('')
  const deferredKeyword = useDeferredValue(keyword)

  return (
    <div className="perf-scenario perf-scenario--correct">
      <div className="perf-scenario__header">
        <h3>1. Correct: useDeferredValue + useMemo</h3>
        <p>
          Input drives <code>keyword</code> (fast). List consumes <code>useDeferredValue(keyword)</code> and
          filters with <code>useMemo</code>. Input stays responsive; heavy work runs in a deferred
          render and can be interrupted.
        </p>
      </div>
      <div className="perf-scenario__measure">
        Type quickly. Input should feel responsive; list may lag slightly behind. Console [measure]
        for the list may show high ms only when the deferred update commits, not on every keystroke.
      </div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Filter (e.g. 10 or A)"
        aria-label="Filter list"
      />
      <FilteredListDeferred deferredKeyword={deferredKeyword} />
      <div className="perf-hint perf-hint--good">
        <strong>Right tool:</strong> useDeferredValue keeps the input on the critical path; the
        expensive list update is deferred and can be interrupted. useMemo caches the filtered result
        so we don’t recompute until deferredKeyword changes. Memoization (React.memo) doesn’t fix
        “heavy work in render”; deferral and caching do.
      </div>
    </div>
  )
}
