import { memo, useRef } from 'react'
import { usePropReferenceLog } from './usePropReferenceLog'
import type { ChildConfig } from './types'

/**
 * Simulates an expensive render (e.g. heavy list, complex tree).
 * When parent re-renders and passes NEW references (inline object/function),
 * React.memo's shallow compare fails → this component re-runs → "expensive" work runs again.
 */
interface Props {
  config: ChildConfig
  onSubmit: (value: string) => void
}

const ITEMS = 500

function simulateExpensiveWork(): number {
  const start = performance.now()
  let sum = 0
  for (let i = 0; i < ITEMS; i++) {
    sum += Math.sqrt(i) * Math.random()
  }
  return performance.now() - start
}

function ExpensiveChildInner({ config, onSubmit }: Props) {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  usePropReferenceLog('ExpensiveChild', { config, onSubmit }, ['config', 'onSubmit'])

  const ms = simulateExpensiveWork()
  console.log(
    `[expensive] ExpensiveChild render #${renderCount} — simulated work took ${ms.toFixed(2)}ms`
  )

  return (
    <div className="expensive-child" data-testid="expensive-child">
      <div className="expensive-child__meta">
        <span className="label">ExpensiveChild (memo)</span>
        <span className="render-count">Render count: {renderCount}</span>
        <span className="config">theme={config.theme} pageSize={config.pageSize}</span>
      </div>
      <button
        type="button"
        onClick={() => onSubmit(`submit-${renderCount}`)}
        className="expensive-child__submit"
      >
        Submit
      </button>
    </div>
  )
}

export const ExpensiveChild = memo(ExpensiveChildInner)
