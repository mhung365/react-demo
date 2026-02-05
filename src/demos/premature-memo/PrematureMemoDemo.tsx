import { useState } from 'react'
import { DashboardInitial } from './DashboardInitial'
import { DashboardPrematureMemo } from './DashboardPrematureMemo'
import { DashboardRefactorNoMemo } from './DashboardRefactorNoMemo'
import { DashboardJustifiedMemo } from './DashboardJustifiedMemo'
import './premature-memo-demo.css'

type Section = 'initial' | 'premature' | 'refactor' | 'justified'

/**
 * Demo: Why is premature memoization a mistake?
 *
 * 1. Initial: dashboard works fine without memo. Simple code, cheap re-renders.
 * 2. Premature: someone added memo/useMemo/useCallback everywhere. Increased complexity,
 *    harder debugging, no measurable gain (we still pass changing props). Locks in poor
 *    architecture (all state at top, "optimize" with memo instead of fixing structure).
 * 3. Refactor: remove memoization and fix the real issue — colocate state so only the
 *    widget that needs tick re-renders. Performance improves WITHOUT memo.
 * 4. Justified: after refactor, we have one expensive child; we measured it. We add memo
 *    + stable props only for that child. Right sequence: refactor → measure → memo only
 *    where needed.
 */
export function PrematureMemoDemo() {
  const [section, setSection] = useState<Section>('initial')

  return (
    <main className="premature-memo-demo">
      <header className="premature-memo-demo__header">
        <h1>Why premature memoization is a mistake</h1>
        <p className="premature-memo-demo__subtitle">
          A dashboard that grows feature by feature. Initial version works fine without memo. Premature memo adds
          complexity and locks in poor architecture with no measurable gain. Refactor by fixing the real issue
          (colocate state); then add memo only where we measured a bottleneck.
        </p>
        <div className="premature-memo-demo__tabs">
          <button
            type="button"
            className={section === 'initial' ? 'active' : ''}
            onClick={() => setSection('initial')}
          >
            Initial (no memo)
          </button>
          <button
            type="button"
            className={section === 'premature' ? 'active' : ''}
            onClick={() => setSection('premature')}
          >
            Premature memo
          </button>
          <button
            type="button"
            className={section === 'refactor' ? 'active' : ''}
            onClick={() => setSection('refactor')}
          >
            Refactor (no memo)
          </button>
          <button
            type="button"
            className={section === 'justified' ? 'active' : ''}
            onClick={() => setSection('justified')}
          >
            Justified memo
          </button>
        </div>
      </header>

      <section className="premature-memo-demo__concepts">
        <h2>Sequence: refactor first, then optimize</h2>
        <ul>
          <li>
            <strong>Initial:</strong> Build the feature without memo. If it’s fast enough, stop. Simple code is easier
            to change.
          </li>
          <li>
            <strong>Premature memo:</strong> Adding memo/useMemo/useCallback before measuring locks in structure
            (e.g. all state at top), increases complexity (deps, callbacks), and often gives no gain (props still
            change). Harder to debug (which dep? stale closure?).
          </li>
          <li>
            <strong>Refactor:</strong> Fix the real issue — colocate state, split components, reduce what re-renders.
            Improve performance <em>without</em> memo. Then measure.
          </li>
          <li>
            <strong>Justified memo:</strong> After refactor, if you measure a bottleneck (e.g. one expensive child),
            add memo + stable props only there. Right order: refactor → measure → memo only where needed.
          </li>
        </ul>
      </section>

      {section === 'initial' && <DashboardInitial />}
      {section === 'premature' && <DashboardPrematureMemo />}
      {section === 'refactor' && <DashboardRefactorNoMemo />}
      {section === 'justified' && <DashboardJustifiedMemo />}
    </main>
  )
}
