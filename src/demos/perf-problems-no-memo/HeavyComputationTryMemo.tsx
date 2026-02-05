import { useState, memo } from 'react'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { generateItems } from './types'

const ITEMS = generateItems(8000)

/**
 * TRY MEMO: We memoize the component that displays the filtered list.
 * It doesn't help: the parent re-renders on every keystroke and passes
 * new `keyword`. So the memoized child still re-renders (props changed).
 * The expensive work is still done in the child during that re-render.
 */
const FilteredListMemo = memo(function FilteredListMemo({ keyword }: { keyword: string }) {
  const filtered = ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      String(item.value).includes(keyword)
  )
  useMeasureRender('FilteredListMemo (memo + heavy filter in render)')
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
})

export function HeavyComputationTryMemo() {
  const [keyword, setKeyword] = useState('')

  return (
    <div className="perf-scenario perf-scenario--try-memo">
      <div className="perf-scenario__header">
        <h3>1. Try memo: memoize the list component</h3>
        <p>
          FilteredList is wrapped in React.memo, but parent passes new <code>keyword</code> every
          keystroke → props change → memo does not skip. Same heavy work every time.
        </p>
      </div>
      <div className="perf-scenario__measure perf-scenario__measure--bad">
        Type in the input. Console [measure] still shows high ms every keystroke. Memo does not
        reduce work: the component still re-renders because its props (keyword) changed.
      </div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Filter (e.g. 10 or A)"
        aria-label="Filter list"
      />
      <FilteredListMemo keyword={keyword} />
      <div className="perf-hint perf-hint--bad">
        <strong>Memo is the wrong tool:</strong> Memo skips re-renders when props are referentially
        equal. Here, <code>keyword</code> is a new string every keystroke, so the child always
        re-renders and recomputes. The fix is to defer the expensive part (useDeferredValue) or
        cache the computation (useMemo) and keep the input on a fast path.
      </div>
    </div>
  )
}
