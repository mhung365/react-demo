import { memo, useRef } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { usePropReferenceLog } from '../expensive-child/usePropReferenceLog'
import type { ExpensiveChildProps } from './types'

const ITEMS = 8000

function simulateExpensiveWork(): number {
  const start = performance.now()
  let sum = 0
  for (let i = 0; i < ITEMS; i++) {
    sum += Math.sqrt(i) * Math.random()
  }
  return performance.now() - start
}

/**
 * Inner implementation: wrapped in React.memo below.
 * React.memo does SHALLOW comparison: for each prop, Object.is(prevProp, nextProp).
 * - Primitives: same value → skip re-render.
 * - Objects/functions: SAME REFERENCE → skip; NEW REFERENCE (e.g. inline {} or () => {}) → re-render.
 * memo does NOT prevent re-renders triggered by: parent re-render with new prop refs, Context update, or state inside this component.
 */
function ExpensiveChildInner({ config, onSubmit, children }: ExpensiveChildProps) {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  useRenderLog('ExpensiveChild (memo)', { renderCount })
  usePropReferenceLog('ExpensiveChild', { config, onSubmit }, ['config', 'onSubmit'])

  const ms = simulateExpensiveWork()
  console.log(
    `[expensive] ExpensiveChild render #${renderCount} — simulated work ${ms.toFixed(2)}ms — memo skipped? NO (we're rendering)`
  )

  return (
    <div className="memo-expensive-child" data-testid="expensive-child">
      <div className="memo-expensive-child__meta">
        <span className="label">ExpensiveChild (React.memo)</span>
        <span className="render-count">Render #{renderCount}</span>
        <span className="config">theme={config.theme} pageSize={config.pageSize}</span>
      </div>
      <button type="button" onClick={() => onSubmit(`submit-${renderCount}`)} className="memo-expensive-child__submit">
        Submit
      </button>
      {children != null && <div className="memo-expensive-child__children">children: {children}</div>}
    </div>
  )
}

export const ExpensiveChild = memo(ExpensiveChildInner)
