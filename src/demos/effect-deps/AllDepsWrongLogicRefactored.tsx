import { useState, useEffect } from 'react'
import { useWhyEffectRan } from './useEffectDepsLog'
import './effect-deps-demo.css'

/**
 * REFACTORED: Effect only [userId]. Search is an event — use onClick.
 *
 * - Effect: run when userId changes (load user context). Deps = [userId]. No searchQuery in effect.
 * - Search click: onClick handler fetches with current searchQuery. Event-driven; no effect needed for "on submit".
 *
 * ESLint is still satisfied (we only use userId in the effect). Logic matches product: fetch on userId change OR Search click.
 */
export function AllDepsWrongLogicRefactored() {
  const [userId, setUserId] = useState('user-1')
  const [searchQuery, setSearchQuery] = useState('')
  const [lastFetched, setLastFetched] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  // Effect: only when userId changes (e.g. load user context)
  useEffect(() => {
    setFetchCount((f) => f + 1)
    setLastFetched(`userId=${userId} (effect: user changed)`)
    console.log(`[Refactored] effect ran — userId changed to ${userId}. deps = [userId].`)
  }, [userId])

  useWhyEffectRan('AllDepsWrongLogicRefactored', [userId], ['userId'])

  // Search: event handler — fetch with current searchQuery when user clicks
  const handleSearchClick = () => {
    setFetchCount((f) => f + 1)
    setLastFetched(`userId=${userId}, query=${searchQuery} (Search click)`)
    console.log(`[Refactored] Search clicked — fetch with query="${searchQuery}". No effect re-run.`)
  }

  return (
    <section className="deps-demo-card deps-demo-card--correct">
      <header className="deps-demo-card__header">
        <h3>Refactored: effect [userId], Search in handler</h3>
        <p>
          Effect deps = <code>[userId]</code> only. Fetch on userId change happens in effect. Fetch on Search click
          happens in <code>onClick</code> with current <code>searchQuery</code>. No searchQuery in effect — no fetch
          on every keystroke. ESLint happy; logic correct.
        </p>
      </header>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">UserId:</span>
        <strong>{userId}</strong>
      </div>
      <div className="deps-demo-card__row">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type — no effect re-run"
          className="deps-demo-card__input"
        />
      </div>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">Fetch count:</span>
        <strong className="deps-demo-card__value">{fetchCount}</strong>
      </div>
      <div className="deps-demo-card__row">
        <span className="deps-demo-card__label">Last fetched:</span>
        <span className="deps-demo-card__value">{lastFetched ?? '—'}</span>
      </div>
      <div className="deps-demo-card__actions">
        <button type="button" onClick={() => setUserId('user-1')}>
          user-1
        </button>
        <button type="button" onClick={() => setUserId('user-2')}>
          user-2
        </button>
        <button type="button" onClick={handleSearchClick}>
          Search
        </button>
      </div>
      <p className="deps-demo-card__hint">
        Type in the input: fetch count does not change. Click Search or change user: fetch count increases. Correct.
      </p>
    </section>
  )
}
