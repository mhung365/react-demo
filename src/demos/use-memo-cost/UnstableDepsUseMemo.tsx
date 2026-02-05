import { useState, useMemo, useRef } from 'react'
import { useMeasureRender } from './useMeasureRender'
import { simulateExpensiveWork } from './simulateWork'
import './use-memo-cost-demo.css'

/**
 * BAD: useMemo with unstable dependencies.
 *
 * config = { theme: 'dark' } is created every render → new reference every time.
 * useMemo compares deps with Object.is → config !== prevConfig every time → we recompute every time.
 * So we pay: (1) dep comparison every render, (2) factory (expensive) every render. We never use the cache.
 * Dependency instability nullifies memoization — we're strictly worse than no useMemo (we'd just run the expensive work in render without the comparison overhead).
 */
export function UnstableDepsUseMemo() {
  const [count, setCount] = useState(0)
  const computeCount = useRef(0)
  useMeasureRender('UnstableDepsUseMemo')

  const config = { theme: 'dark' as const }
  const result = useMemo(() => {
    computeCount.current += 1
    const workMs = simulateExpensiveWork()
    console.log(
      `[UnstableDepsUseMemo] useMemo factory ran (compute #${computeCount.current}) — expensive work ${workMs.toFixed(2)}ms. ` +
        `Deps [config] are unstable (new object every render) → we recompute EVERY time. Memo adds comparison overhead and never caches.`
    )
    return { theme: config.theme, workMs }
  }, [config])

  return (
    <section className="memo-cost-card memo-cost-card--wrong">
      <header className="memo-cost-card__header">
        <h3>Unstable deps nullify memoization</h3>
        <p>
          useMemo(() =&gt; expensive(), [config]) but <code>config = {`{ theme: 'dark' }`}</code> is created every render → new reference. React compares deps with Object.is → config !== prev every time → <strong>recompute every time</strong>. We pay comparison + factory every render; cache never used. Worse than no useMemo.
        </p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Count:</span>
        <strong>{count}</strong>
      </div>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">result.theme:</span>
        <strong>{result.theme}</strong>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment (re-render)
      </button>
      <p className="memo-cost-card__hint memo-cost-card__hint--wrong">
        Each click → re-render → new config ref → useMemo sees "deps changed" → recomputes (expensive). Cache never used. Check console: factory runs every time.
      </p>
    </section>
  )
}
