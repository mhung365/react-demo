import { useState, useRef } from 'react'
import { useMeasureRender } from './useMeasureRender'
import { cheapComputation } from './simulateWork'
import './use-memo-cost-demo.css'

/**
 * BETTER: Same cheap computation, no useMemo.
 *
 * We just compute in render: const config = cheapComputation(). No comparison, no cache storage.
 * For a trivial computation and no consumer that needs stable ref, this is simpler and avoids
 * memo overhead. No "render vs memo cost" — we only have render cost.
 */
export function BetterWithoutUseMemo() {
  const [count, setCount] = useState(0)
  const renderCount = useRef(0)
  renderCount.current += 1
  useMeasureRender('BetterWithoutUseMemo')

  const config = cheapComputation()

  if (renderCount.current <= 2) {
    console.log(
      `[BetterWithoutUseMemo] Computed in render (no useMemo). No comparison overhead; no cache. ` +
        `For cheap computation with no stable-ref consumer, this is simpler and can be faster.`
    )
  }

  return (
    <section className="memo-cost-card memo-cost-card--correct">
      <header className="memo-cost-card__header">
        <h3>Better without useMemo</h3>
        <p>
          <code>config</code> = cheapComputation() in render. No useMemo — no dep comparison, no cache. Same result; simpler code; no memo overhead. When nothing needs a stable reference, skip useMemo.
        </p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Count:</span>
        <strong>{count}</strong>
      </div>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">config.theme:</span>
        <strong>{config.theme}</strong>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment (re-render)
      </button>
      <p className="memo-cost-card__hint">
        Each click → re-render → compute in render. No memo cost. Compare [measure] time with UnnecessaryUseMemo (similar or slightly better without memo).
      </p>
    </section>
  )
}
