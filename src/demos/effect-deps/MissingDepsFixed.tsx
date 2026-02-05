import { useState, useEffect } from 'react'
import { useWhyEffectRan } from './useEffectDepsLog'
import './effect-deps-demo.css'

/**
 * FIXED: Effect uses userId and deps are [userId].
 *
 * We promise React: "re-run when userId changes." React compares prev deps with current using Object.is;
 * when userId changes, effect re-runs. We load for the correct user. Cleanup (if we had a subscription)
 * would run before the new effect. No ESLint disable; correct contract.
 */
export function MissingDepsFixed() {
  const [userId, setUserId] = useState('user-1')
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    setLoadedFor(userId)
    console.log(
      `[MissingDepsFixed] effect ran with userId = ${userId}. deps = [userId]. ` +
        `When you change userId, React re-runs this effect (contract satisfied).`
    )
    return () => {
      console.log(`[MissingDepsFixed] cleanup for userId = ${userId} (before next effect or unmount).`)
    }
  }, [userId])

  useWhyEffectRan('MissingDepsFixed', [userId], ['userId'])

  return (
    <section className="deps-demo-card deps-demo-card--correct">
      <header className="deps-demo-card__header">
        <h3>Fixed: correct dependencies</h3>
        <p>
          Effect uses <code>userId</code> and deps are <code>[userId]</code>. We promise React &quot;re-run when userId changes.&quot;
          Switch user → cleanup runs → effect re-runs with new userId. No stale value; no ESLint disable.
        </p>
      </header>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">Current userId:</span>
        <strong>{userId}</strong>
      </div>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">Loaded for (from effect):</span>
        <strong className="deps-demo-card__value">{loadedFor ?? '—'}</strong>
      </div>
      <div className="deps-demo-card__actions">
        <button type="button" onClick={() => setUserId('user-1')}>
          user-1
        </button>
        <button type="button" onClick={() => setUserId('user-2')}>
          user-2
        </button>
      </div>
      <p className="deps-demo-card__hint">
        Switch to user-2: &quot;Loaded for&quot; updates. Effect re-ran because deps changed. Check console for &quot;reason: deps changed&quot;.
      </p>
    </section>
  )
}
