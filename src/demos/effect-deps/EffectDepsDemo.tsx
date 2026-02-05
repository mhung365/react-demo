import { useState } from 'react'
import { MissingDepsBug } from './MissingDepsBug'
import { MissingDepsFixed } from './MissingDepsFixed'
import { AllDepsUnnecessaryRuns } from './AllDepsUnnecessaryRuns'
import { AllDepsUnnecessaryRefactored } from './AllDepsUnnecessaryRefactored'
import { AllDepsWrongLogic } from './AllDepsWrongLogic'
import { AllDepsWrongLogicRefactored } from './AllDepsWrongLogicRefactored'
import './effect-deps-demo.css'

type Section =
  | 'missing-bug'
  | 'missing-fixed'
  | 'unnecessary'
  | 'unnecessary-refactored'
  | 'wrong-logic'
  | 'wrong-logic-refactored'

/**
 * Demo: useEffect dependency array as a contract; when ESLint is correct but logic is wrong.
 *
 * - The dependency array promises React: "re-run this effect when any of these values change (Object.is)."
 * - Missing deps → stale values (effect doesn't re-run when it should). ESLint warns.
 * - All deps included but wrong intent → unnecessary re-runs or wrong trigger (e.g. fetch on keystroke).
 * - "Just disable the rule" hides real bugs (stale) or forces wrong deps. Fix the logic instead.
 */
export function EffectDepsDemo() {
  const [section, setSection] = useState<Section>('missing-bug')

  return (
    <main className="deps-demo">
      <header className="deps-demo__header">
        <h1>useEffect dependency array: contract and ESLint</h1>
        <p className="deps-demo__subtitle">
          The dependency array is a <strong>contract</strong>: &quot;React, re-run this effect when any of these values
          change (compared with Object.is).&quot; Missing deps → stale values. Adding everything ESLint wants can still
          be wrong (unnecessary re-runs or wrong trigger). Don&apos;t disable the rule — fix the logic (event handlers,
          refs, or correct deps).
        </p>
        <div className="deps-demo__tabs">
          <button
            type="button"
            className={section === 'missing-bug' ? 'active' : ''}
            onClick={() => setSection('missing-bug')}
          >
            Missing deps (bug)
          </button>
          <button
            type="button"
            className={section === 'missing-fixed' ? 'active' : ''}
            onClick={() => setSection('missing-fixed')}
          >
            Missing deps (fixed)
          </button>
          <button
            type="button"
            className={section === 'unnecessary' ? 'active' : ''}
            onClick={() => setSection('unnecessary')}
          >
            Unnecessary re-runs
          </button>
          <button
            type="button"
            className={section === 'unnecessary-refactored' ? 'active' : ''}
            onClick={() => setSection('unnecessary-refactored')}
          >
            Unnecessary (refactored)
          </button>
          <button
            type="button"
            className={section === 'wrong-logic' ? 'active' : ''}
            onClick={() => setSection('wrong-logic')}
          >
            Wrong logic (fetch on keystroke)
          </button>
          <button
            type="button"
            className={section === 'wrong-logic-refactored' ? 'active' : ''}
            onClick={() => setSection('wrong-logic-refactored')}
          >
            Wrong logic (refactored)
          </button>
        </div>
      </header>

      <section className="deps-demo__concepts">
        <h2>Contract and React&apos;s decision</h2>
        <ul>
          <li>
            <strong>What the dependency array promises:</strong> &quot;Re-run this effect when any value in this array
            changes (compared with Object.is).&quot; Empty array [] = &quot;never re-run after mount.&quot; No array = re-run every render.
          </li>
          <li>
            <strong>How React decides:</strong> After commit, React compares each dependency with its previous value
            using Object.is. If any differ, the previous effect&apos;s cleanup runs, then the effect runs again with the new values.
          </li>
          <li>
            <strong>ESLint exhaustive-deps:</strong> Warns when you use a value inside the effect that isn&apos;t in the
            deps list. It enforces &quot;contract completeness&quot; — but it can&apos;t know your intent. Adding everything can cause
            unnecessary re-runs or wrong trigger (e.g. fetch on every keystroke). Refactor: event handlers, derived state, refs, or correct deps.
          </li>
          <li>
            <strong>Why not disable the rule:</strong> Disabling hides real bugs (stale values when deps are missing).
            Fix by adding the right deps + cleanup, or by changing the pattern (e.g. event handler for &quot;on Search click&quot;).
          </li>
        </ul>
      </section>

      {section === 'missing-bug' && <MissingDepsBug />}
      {section === 'missing-fixed' && <MissingDepsFixed />}
      {section === 'unnecessary' && <AllDepsUnnecessaryRuns />}
      {section === 'unnecessary-refactored' && <AllDepsUnnecessaryRefactored />}
      {section === 'wrong-logic' && <AllDepsWrongLogic />}
      {section === 'wrong-logic-refactored' && <AllDepsWrongLogicRefactored />}
    </main>
  )
}
