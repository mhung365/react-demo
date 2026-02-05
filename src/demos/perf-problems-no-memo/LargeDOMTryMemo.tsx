import { memo, useRef, useState } from 'react'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { generateItems } from './types'

const ITEMS = generateItems(2000)

/**
 * TRY MEMO: We memoize each row. We still render 2000 rows on the initial
 * pass — memo doesn't reduce the number of components or DOM nodes. It only
 * helps when the parent re-renders and passes the same props; here the
 * initial render is the problem.
 */
const RowMemo = memo(function RowMemo({
  item,
}: {
  item: { id: number; name: string; value: number }
}) {
  return (
    <div className="perf-list-item">
      {item.name} — {item.value}
    </div>
  )
})

export function LargeDOMTryMemo() {
  const [initialRenderMs, setInitialRenderMs] = useState<number | null>(null)
  const measured = useRef(false)
  useMeasureRender('LargeDOMTryMemo (2000 memoized items)', (ms) => {
    if (!measured.current) {
      measured.current = true
      setInitialRenderMs(ms)
    }
  })

  return (
    <div className="perf-scenario perf-scenario--try-memo">
      <div className="perf-scenario__header">
        <h3>2. Try memo: memoize each row</h3>
        <p>
          Each row is wrapped in React.memo. We still mount 2000 components and create 2000 DOM
          nodes on first render. Memo doesn’t reduce DOM size.
        </p>
      </div>
      <div className="perf-scenario__measure perf-scenario__measure--bad">
        Initial list render (approx): {initialRenderMs != null ? `${initialRenderMs.toFixed(1)}ms` : '…'} —
        Similar to problem. Memo adds comparison overhead per row and doesn’t fix the bottleneck.
      </div>
      <div className="perf-list-container">
        {ITEMS.map((item) => (
          <RowMemo key={item.id} item={item} />
        ))}
      </div>
      <div className="perf-hint perf-hint--bad">
        <strong>Memo is the wrong tool:</strong> The bottleneck is the number of DOM nodes and
        layout/paint cost. Memo only avoids re-renders when props are equal; it doesn’t reduce
        initial render or DOM size. Fix: virtualize — render only the visible window of items.
      </div>
    </div>
  )
}
