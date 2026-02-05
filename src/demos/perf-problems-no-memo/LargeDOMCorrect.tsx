import { useRef, useState } from 'react'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { useVirtualList } from './useVirtualList'
import { generateItems } from './types'

const ITEMS = generateItems(2000)
const CONTAINER_HEIGHT = 200

/**
 * CORRECT: Virtual list. We have 2000 items in data but only render the
 * visible window (~20–30 items). DOM node count stays small; initial
 * render and scroll are fast. Memo is irrelevant here — we fixed the
 * problem by not creating 2000 nodes.
 */
function VirtualListRow({
  item,
  style,
}: {
  item: { id: number; name: string; value: number }
  style: React.CSSProperties
}) {
  return (
    <div className="perf-virtual-list__item" style={style}>
      {item.name} — {item.value}
    </div>
  )
}

export function LargeDOMCorrect() {
  const [initialRenderMs, setInitialRenderMs] = useState<number | null>(null)
  const measured = useRef(false)
  const {
    totalHeight,
    visibleItems,
    startIndex,
    onScroll,
    rowHeight,
  } = useVirtualList({
    items: ITEMS,
    containerHeight: CONTAINER_HEIGHT,
    getItemKey: (item) => item.id,
  })

  useMeasureRender('LargeDOMCorrect (virtual list)', (ms) => {
    if (!measured.current) {
      measured.current = true
      setInitialRenderMs(ms)
    }
  })

  return (
    <div className="perf-scenario perf-scenario--correct">
      <div className="perf-scenario__header">
        <h3>2. Correct: virtualize the list</h3>
        <p>
          Same 2000 items in data; only the visible window (~{visibleItems.length} nodes) is
          rendered. DOM size stays small; initial render and scroll are fast.
        </p>
      </div>
      <div className="perf-scenario__measure">
        Initial list render (approx): {initialRenderMs != null ? `${initialRenderMs.toFixed(1)}ms` : '…'} —
        Only {visibleItems.length} items in DOM. Scroll to see smooth updates.
      </div>
      <div
        className="perf-virtual-list"
        style={{ height: CONTAINER_HEIGHT }}
        onScroll={onScroll}
      >
        <div
          className="perf-virtual-list__inner"
          style={{ height: totalHeight, minHeight: totalHeight }}
        >
          {visibleItems.map((item, i) => (
            <VirtualListRow
              key={item.id}
              item={item}
              style={{
                top: (startIndex + i) * rowHeight,
                height: rowHeight,
              }}
            />
          ))}
        </div>
      </div>
      <div className="perf-hint perf-hint--good">
        <strong>Right tool:</strong> Virtualization reduces DOM nodes to the visible window. Memo
        doesn’t address “too many nodes”; rendering fewer nodes does. Use react-window or
        react-virtuoso in production for edge cases (dynamic heights, etc.).
      </div>
    </div>
  )
}
