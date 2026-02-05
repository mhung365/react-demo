import { useState } from 'react'
import { InitialSmallScale } from './InitialSmallScale'
import { ScaledWithBugs } from './ScaledWithBugs'
import { RefactoredScalable } from './RefactoredScalable'
import './state-scale-bugs-demo.css'

type Section = 'initial' | 'scaled' | 'refactored'

/**
 * Demo: What kinds of bugs appear when state is placed incorrectly as the app scales?
 *
 * - Initial: List + Detail, selectedId in parent. Works for small scale.
 * - Scaled with bugs: Add Favorites, Recent. Stale UI (Recent list has its own highlightedId), inconsistent data (Detail "Clear" only local state), unnecessary re-renders (5+ per action).
 * - Refactored: Single source of truth; no local overrides; memo where helpful.
 */
export function StateScaleBugsDemo() {
  const [section, setSection] = useState<Section>('initial')

  return (
    <main className="state-scale-bugs-demo">
      <header className="state-scale-bugs-demo__header">
        <h1>State placement bugs at scale</h1>
        <p className="state-scale-bugs-demo__subtitle">
          A state placement that seems fine initially can break as features are added: <strong>stale UI</strong> (duplicate local state that doesn&apos;t sync), <strong>inconsistent data</strong> (two sources of truth), <strong>unnecessary re-renders</strong> (everything in one place). Refactor: single source of truth, no local overrides for shared state, memo to narrow re-render scope. Open the console to see <code>[render]</code> logs.
        </p>
        <div className="state-scale-bugs-demo__tabs">
          <button
            type="button"
            className={section === 'initial' ? 'active' : ''}
            onClick={() => setSection('initial')}
          >
            Initial (small scale)
          </button>
          <button
            type="button"
            className={section === 'scaled' ? 'active' : ''}
            onClick={() => setSection('scaled')}
          >
            Scaled with bugs
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (scalable)
          </button>
        </div>
      </header>

      <section className="state-scale-bugs-demo__concepts">
        <h2>Bugs from incorrect state placement at scale</h2>
        <ul>
          <li>
            <strong>Stale UI:</strong> A child keeps its own copy of &quot;which item is selected&quot; (e.g. highlightedId). When the parent&apos;s selectedId changes (e.g. user selects from another list), the child&apos;s copy doesn&apos;t update — the child shows the wrong highlight. Fix: one source of truth (parent); child receives selectedId as prop.
          </li>
          <li>
            <strong>Inconsistent data:</strong> A child has local state that overrides display (e.g. &quot;Clear selection&quot; sets local &quot;cleared&quot; so the child shows empty) but the parent still has the old value. List shows selected, Detail shows &quot;Select an item&quot;. Fix: actions that change shared state must update the owner (parent); no local override.
          </li>
          <li>
            <strong>Unnecessary re-renders:</strong> All state in one parent; any update re-renders every child. Add memo + stable props to narrow scope, or split state by feature so only the subtree that needs it re-renders.
          </li>
        </ul>
      </section>

      {section === 'initial' && <InitialSmallScale />}
      {section === 'scaled' && <ScaledWithBugs />}
      {section === 'refactored' && <RefactoredScalable />}
    </main>
  )
}
