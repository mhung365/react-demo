import { useState, useEffect } from 'react'
import { useWhyEffectRan } from './useEffectDepsLog'
import './effect-deps-demo.css'

/**
 * BUG: Effect uses userId but deps are [].
 *
 * The dependency array is a contract: "React, re-run this effect when any of these values change (Object.is)."
 * We promised [] (never re-run after mount). So when userId changes, React does NOT re-run the effect.
 * The effect closed over the initial userId — stale. ESLint exhaustive-deps warns about this.
 *
 * Result: switch user → "loaded for" stays on the first user (stale).
 */
export function MissingDepsBug() {
  const [userId, setUserId] = useState('user-1')
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  // Intentionally wrong: we use userId inside but deps are []
  // eslint-disable-next-line react-hooks/exhaustive-deps -- demo: showing the bug
  useEffect(() => {
    setLoadedFor(userId)
    console.log(
      `[MissingDepsBug] effect ran with userId = ${userId}. deps = []. ` +
        `When you change userId, this effect will NOT re-run (we promised []). Stale value.`
    )
  }, [])

  useWhyEffectRan('MissingDepsBug', [], [])

  return (
    <section className="deps-demo-card deps-demo-card--wrong">
      <header className="deps-demo-card__header">
        <h3>Bug: missing dependencies</h3>
        <p>
          Effect uses <code>userId</code> but deps are <code>[]</code>. We promised React &quot;never re-run after mount.&quot;
          When you switch user, effect does not re-run — <strong>stale</strong> <code>loadedFor</code>. ESLint warns.
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
      <p className="deps-demo-card__hint deps-demo-card__hint--wrong">
        Switch to user-2: &quot;Loaded for&quot; stays user-1. Effect did not re-run. Stale closure.
      </p>
    </section>
  )
}
