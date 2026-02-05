import { useState, useEffect } from 'react'
import { useWhyEffectRan } from './useEffectDepsLog'
import './effect-deps-demo.css'

/**
 * ESLint satisfied, but business logic is wrong.
 *
 * Product requirement: "Fetch when userId changes OR when user clicks Search." We have userId and searchQuery.
 * If we put both in deps, effect runs when searchQuery changes (every keystroke) — we fetch on every keystroke.
 * ESLint is happy (all values used in effect are in deps) but behavior is wrong: we wanted fetch on Search click,
 * not on every input change.
 *
 * Refactor: effect only [userId]. "Search" is an event — use onClick handler that fetches with current searchQuery.
 * Don't put searchQuery in effect deps; use event handler for submit.
 */
export function AllDepsWrongLogic() {
  const [userId, setUserId] = useState('user-1')
  const [searchQuery, setSearchQuery] = useState('')
  const [lastFetched, setLastFetched] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  // Wrong: we "fetch" when userId or searchQuery change. Product wanted: fetch when userId changes OR Search clicked.
  // So searchQuery in deps causes fetch on every keystroke.
  useEffect(() => {
    setFetchCount((f) => f + 1)
    setLastFetched(`userId=${userId}, query=${searchQuery}`)
    console.log(
      `[AllDepsWrongLogic] effect ran — fetching userId=${userId}, query=${searchQuery}. ` +
        `Because searchQuery is in deps, this runs on every keystroke. We wanted fetch on Search click only.`
    )
  }, [userId, searchQuery])

  useWhyEffectRan('AllDepsWrongLogic', [userId, searchQuery], ['userId', 'searchQuery'])

  const handleSearchClick = () => {
    setFetchCount((f) => f + 1)
    setLastFetched(`userId=${userId}, query=${searchQuery} (from Search click)`)
    console.log(
      `[AllDepsWrongLogic] Search clicked — fetch with current query. This is the right trigger for "search".`
    )
  }

  return (
    <section className="deps-demo-card deps-demo-card--wrong">
      <header className="deps-demo-card__header">
        <h3>ESLint satisfied, logic wrong</h3>
        <p>
          Requirement: fetch when <strong>userId</strong> changes or user clicks <strong>Search</strong>. We put{' '}
          <code>[userId, searchQuery]</code> in deps. ESLint is happy, but effect runs on every keystroke — wrong.
          Fix: effect only <code>[userId]</code>; handle Search in <code>onClick</code> (event), not in effect.
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
          placeholder="Type to see effect re-run"
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
          Search (correct trigger)
        </button>
      </div>
      <p className="deps-demo-card__hint deps-demo-card__hint--wrong">
        Type in the input: fetch count increases on every keystroke. Refactor: effect [userId] only; Search → onClick.
      </p>
    </section>
  )
}
