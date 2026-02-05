import { useState } from 'react'
import { AcceptableUseEffectFetch } from './AcceptableUseEffectFetch'
import { BrokenUseEffectFetch } from './BrokenUseEffectFetch'
import { StaleParamsFetch } from './StaleParamsFetch'
import { FixedRaceUseEffectFetch } from './FixedRaceUseEffectFetch'
import { RefactoredFetch } from './RefactoredFetch'
import './data-fetching-demo.css'

type Section =
  | 'acceptable'
  | 'broken'
  | 'stale'
  | 'fixed'
  | 'refactored'

/**
 * Demo: When is it acceptable to fetch data inside useEffect, and when is it a bad idea?
 *
 * - Acceptable: one-off fetch on mount (e.g. user profile) with proper cleanup; empty deps.
 * - Broken: filter-driven fetch without cancellation → race condition (older response overwrites newer).
 * - Stale: empty deps so filters never trigger refetch → stale params.
 * - Fixed: same as broken but with cancelled flag + correct deps (minimal fix).
 * - Refactored: React Query for filter-driven data (no manual useEffect, cache, cancellation).
 *
 * Open console to see [fetch] start/end and parameters.
 */
export function DataFetchingDemo() {
  const [section, setSection] = useState<Section>('acceptable')

  return (
    <main className="data-fetch-demo">
      <header className="data-fetch-demo__header">
        <h1>Data fetching: useEffect — when acceptable vs when it hurts</h1>
        <p className="data-fetch-demo__subtitle">
          <strong>Acceptable:</strong> fetch once on mount (profile, config) with cleanup and empty deps.{' '}
          <strong>Bad:</strong> filter-driven fetch without cancellation (race), or wrong deps (stale params).{' '}
          <strong>Refactor:</strong> add cancellation + correct deps, or use React Query for server state.
          Open console for <code>[fetch]</code> start/end and params.
        </p>
        <div className="data-fetch-demo__tabs">
          <button
            type="button"
            className={section === 'acceptable' ? 'active' : ''}
            onClick={() => setSection('acceptable')}
          >
            Acceptable (mount-only)
          </button>
          <button
            type="button"
            className={section === 'broken' ? 'active' : ''}
            onClick={() => setSection('broken')}
          >
            Broken (race)
          </button>
          <button
            type="button"
            className={section === 'stale' ? 'active' : ''}
            onClick={() => setSection('stale')}
          >
            Broken (stale params)
          </button>
          <button
            type="button"
            className={section === 'fixed' ? 'active' : ''}
            onClick={() => setSection('fixed')}
          >
            Fixed (cancellation)
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (React Query)
          </button>
        </div>
      </header>

      <section className="data-fetch-demo__concepts">
        <h2>When useEffect fetch is OK vs not</h2>
        <ul>
          <li><strong>OK:</strong> One-off load on mount (user profile, app config). Empty deps <code>[]</code>, cancelled flag in cleanup.</li>
          <li><strong>Risky:</strong> Fetch when filters/params change. You must cancel in-flight requests (cleanup) and use correct deps, or you get race conditions or stale data.</li>
          <li><strong>Better:</strong> For filter-driven server data, use React Query (or similar): it handles cache, cancellation, loading/error; you avoid manual useEffect.</li>
        </ul>
      </section>

      {section === 'acceptable' && <AcceptableUseEffectFetch />}
      {section === 'broken' && <BrokenUseEffectFetch />}
      {section === 'stale' && <StaleParamsFetch />}
      {section === 'fixed' && <FixedRaceUseEffectFetch />}
      {section === 'refactored' && <RefactoredFetch />}
    </main>
  )
}
