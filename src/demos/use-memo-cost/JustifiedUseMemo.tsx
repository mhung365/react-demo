import { useState, useMemo, memo, useRef } from 'react'
import { useMeasureRender } from './useMeasureRender'
import { simulateExpensiveWork } from './simulateWork'
import './use-memo-cost-demo.css'

/**
 * Memoized child: re-renders only when result prop (reference) changes.
 */
const ExpensiveListChild = memo(function ExpensiveListChild({
  result,
  label,
}: {
  result: { sum: number; count: number }
  label: string
}) {
  const renderCount = useRef(0)
  renderCount.current += 1
  const workMs = simulateExpensiveWork()
  console.log(
    `[JustifiedUseMemo] ExpensiveListChild render #${renderCount.current} — child work ${workMs.toFixed(2)}ms (expensive)`
  )
  return (
    <div className="memo-cost-card__child">
      <span className="memo-cost-card__label">{label}</span>
      <span>sum={result.sum}, count={result.count}</span>
      <span className="memo-cost-card__value">(child renders: {renderCount.current})</span>
    </div>
  )
})

/**
 * JUSTIFIED: Expensive computation + memoized child that receives the result.
 *
 * - useMemo([list, filter]): when parent re-renders for another reason (e.g. count), deps unchanged → return cached value → same reference → child skips re-render.
 * - Without useMemo we'd recompute every time and pass new reference → child re-renders every time → expensive child work every time.
 *
 * Here we simulate expensive work in the factory. When count changes (parent re-renders), useMemo deps [list] are unchanged → cache hit → no expensive work, same ref → child does not re-render.
 */
export function JustifiedUseMemo() {
  const [count, setCount] = useState(0)
  const [list] = useState(() => Array.from({ length: 100 }, (_, i) => i))
  const computeCount = useRef(0)
  useMeasureRender('JustifiedUseMemo')

  const result = useMemo(() => {
    computeCount.current += 1
    const start = performance.now()
    const workMs = simulateExpensiveWork()
    const sum = list.reduce((a, b) => a + b, 0)
    const elapsed = performance.now() - start
    console.log(
      `[JustifiedUseMemo] useMemo factory ran (compute #${computeCount.current}) — expensive work ${workMs.toFixed(2)}ms, total ${elapsed.toFixed(2)}ms. ` +
        `When count changes, deps [list] unchanged → cache hit → skip this.`
    )
    return { sum, count: list.length }
  }, [list])

  return (
    <section className="memo-cost-card memo-cost-card--correct">
      <header className="memo-cost-card__header">
        <h3>Justified useMemo</h3>
        <p>
          Expensive computation (simulated) + <strong>memoized child</strong> that receives the result. useMemo([list]): when parent re-renders for <code>count</code>, deps unchanged → cache hit → no recompute, same ref → child skips. Without useMemo: recompute every time + new ref → child re-renders every time.
        </p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Count (re-renders parent):</span>
        <strong>{count}</strong>
      </div>
      <ExpensiveListChild result={result} label="Result:" />
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment (re-render parent)
      </button>
      <p className="memo-cost-card__hint">
        Click Increment: parent re-renders but useMemo returns cached result (deps unchanged). Child does NOT re-render (same ref). Check console: factory does not run again; child render count stays 1.
      </p>
    </section>
  )
}
