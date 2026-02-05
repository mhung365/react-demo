import { useState, useEffect } from 'react'
import { useWhyEffectRan } from './useEffectDepsLog'
import './effect-deps-demo.css'

/**
 * ESLint satisfied, but unnecessary re-runs.
 *
 * We want to run once on mount (e.g. "subscribe to global notifications"). Inside the effect we
 * log count (or use it in some way). ESLint says: add count to deps. We add count. Now the effect
 * re-runs every time count changes — we're doing "subscribe" again and again. Logic bug: we only
 * wanted mount. ESLint was "correct" (we do use count in the effect) but the *intent* was "run once";
 * we shouldn't have used count in the effect, or we should use a ref for "latest count" if we only
 * need it for the callback.
 *
 * Refactor: remove count from the effect body (or use ref). Then deps can stay [] and we run once.
 */
export function AllDepsUnnecessaryRuns() {
  const [count, setCount] = useState(0)
  const [runCount, setRunCount] = useState(0)

  // We "use" count inside so ESLint wants [count]. But we only wanted to run on mount (simulate subscribe).
  // With [count], effect re-runs every time count changes — unnecessary.
  useEffect(() => {
    setRunCount((r) => r + 1)
    console.log(
      `[AllDepsUnnecessary] effect ran. count = ${count}. ` +
        `If deps = [count], this runs on every count change. We only wanted mount.`
    )
    return () => {
      console.log(`[AllDepsUnnecessary] cleanup (would unsubscribe).`)
    }
  }, [count])

  useWhyEffectRan('AllDepsUnnecessary', [count], ['count'])

  return (
    <section className="deps-demo-card deps-demo-card--warning">
      <header className="deps-demo-card__header">
        <h3>ESLint satisfied, unnecessary re-runs</h3>
        <p>
          Effect should run <strong>once on mount</strong> (e.g. subscribe). We use <code>count</code> inside
          (e.g. log it), so ESLint says add <code>count</code> to deps. We do. Now effect re-runs on every
          count change — &quot;subscribe&quot; runs again and again. Fix: don&apos;t use count in effect (or use ref);
          keep deps <code>[]</code>.
        </p>
      </header>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">Count:</span>
        <strong>{count}</strong>
      </div>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">Effect run count:</span>
        <strong className="deps-demo-card__value">{runCount}</strong>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
      <p className="deps-demo-card__hint">
        Each click → effect re-runs (run count goes up). We only wanted one run on mount. Refactor: remove count from effect or use ref; deps = [].
      </p>
    </section>
  )
}
