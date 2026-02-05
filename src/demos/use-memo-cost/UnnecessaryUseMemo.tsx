import { useState, useMemo, useRef } from 'react'
import { useMeasureRender } from './useMeasureRender'
import { cheapComputation } from './simulateWork'
import './use-memo-cost-demo.css'

/**
 * UNNECESSARY: useMemo for a cheap computation with no consumer that needs a stable reference.
 *
 * - The computation (return { theme: 'dark' }) is trivial — cheaper than the memo comparison.
 * - Nothing downstream is memoized or depends on referential equality of this value.
 * - We pay: (1) store previous deps + result, (2) compare deps every render. Benefit: none.
 *
 * Each re-render: useMemo runs dep comparison; when deps stable we return cached (factory doesn't run).
 * The overhead of memoization (comparison, storage) is wasted — we could just compute in render.
 */
export function UnnecessaryUseMemo() {
  const [count, setCount] = useState(0)
  const memoCallCount = useRef(0)
  useMeasureRender('UnnecessaryUseMemo')

  const config = useMemo(() => {
    memoCallCount.current += 1
    console.log(
      `[UnnecessaryUseMemo] useMemo factory ran (count=${memoCallCount.current}). ` +
        `Cheap computation — memo adds overhead (comparison every render) with no benefit (no memoized child).`
    )
    return cheapComputation()
  }, [])

  return (
    <section className="memo-cost-card memo-cost-card--wrong">
      <header className="memo-cost-card__header">
        <h3>Unnecessary useMemo</h3>
        <p>
          <code>config</code> = useMemo(() =&gt; cheapComputation(), []). The computation is trivial; no child needs a stable ref. We pay dep comparison every render and store prev result for <strong>no benefit</strong>. Render cost includes memo overhead.
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
      <p className="memo-cost-card__hint memo-cost-card__hint--wrong">
        Each click → re-render → useMemo compares deps (overhead) → returns cached. No consumer needs stable ref. Check console for [measure] and factory run count (only once; cache hit after).
      </p>
    </section>
  )
}
