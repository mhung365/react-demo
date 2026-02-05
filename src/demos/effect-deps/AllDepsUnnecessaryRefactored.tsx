import { useState, useEffect } from 'react'
import { useWhyEffectRan } from './useEffectDepsLog'
import './effect-deps-demo.css'

/**
 * REFACTORED: Effect runs once on mount. We don't use count in the effect.
 *
 * If we needed "latest count" inside a callback (e.g. notification handler), we'd use a ref and
 * read ref.current in the callback — then we don't add count to deps and we don't re-run on every count change.
 * Here we simply don't use count in the effect; deps = []. No ESLint disable; correct contract.
 */
export function AllDepsUnnecessaryRefactored() {
  const [count, setCount] = useState(0)
  const [runCount, setRunCount] = useState(0)

  useEffect(() => {
    setRunCount((r) => r + 1)
    console.log(
      `[Refactored Unnecessary] effect ran once on mount. deps = []. ` +
        `We don't use count in the effect, so we don't add it to deps. No unnecessary re-runs.`
    )
    return () => {
      console.log(`[Refactored Unnecessary] cleanup on unmount.`)
    }
  }, [])

  useWhyEffectRan('AllDepsUnnecessaryRefactored', [], [])

  return (
    <section className="deps-demo-card deps-demo-card--correct">
      <header className="deps-demo-card__header">
        <h3>Refactored: run once on mount</h3>
        <p>
          Effect does not use <code>count</code>. Deps = <code>[]</code>. Effect runs once on mount; incrementing
          count does not re-run the effect. No ESLint disable; no unnecessary re-runs.
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
        Click Increment: effect run count stays 1. Effect did not re-run. Correct.
      </p>
    </section>
  )
}
