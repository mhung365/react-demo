import { useRef, useState } from 'react'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { generateItems } from './types'

const ITEMS = generateItems(2000)

/**
 * PROBLEM: Large DOM tree.
 * We render 2000 list items. Every item is a DOM node. Initial render and
 * layout/paint are expensive. Memoization does not reduce DOM node count —
 * it only skips re-renders when props are equal. The problem is the number
 * of nodes, not re-renders.
 */
function Row({ item }: { item: { id: number; name: string; value: number } }) {
  return (
    <div className="perf-list-item">
      {item.name} — {item.value}
    </div>
  )
}

export function LargeDOMProblem() {
  const [initialRenderMs, setInitialRenderMs] = useState<number | null>(null)
  const measured = useRef(false)
  useMeasureRender('LargeDOMProblem (2000 items)', (ms) => {
    if (!measured.current) {
      measured.current = true
      setInitialRenderMs(ms)
    }
  })

  return (
    <div className="perf-scenario perf-scenario--problem">
      <div className="perf-scenario__header">
        <h3>2. Problem: large DOM tree</h3>
        <p>
          Rendering 2000 list items creates 2000 DOM nodes. Initial render and scroll/layout are
          heavy. Memo won’t reduce the number of nodes.
        </p>
      </div>
      <div className="perf-scenario__measure perf-scenario__measure--bad">
        Initial list render (approx): {initialRenderMs != null ? `${initialRenderMs.toFixed(1)}ms` : '…'} —
        Check console [measure]. 2000 DOM nodes; memo cannot fix that.
      </div>
      <div className="perf-list-container">
        {ITEMS.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </div>
      <div className="perf-hint perf-hint--bad">
        <strong>Why memo fails:</strong> React.memo on each row only skips re-renders when props
        don’t change. We still have 2000 components and 2000 DOM nodes. The cost is DOM size and
        initial render; the fix is to render only visible rows (virtualization).
      </div>
    </div>
  )
}
