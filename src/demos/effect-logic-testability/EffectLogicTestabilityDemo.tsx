import { useState } from 'react'
import { HeavyLogicInEffect } from './HeavyLogicInEffect'
import { RefactoredPureAndHook } from './RefactoredPureAndHook'
import './effect-logic-testability-demo.css'

type Section = 'heavy' | 'refactored'

/**
 * Demo: Why logic inside useEffect is hard to test, and where it should live.
 *
 * - Heavy: Validation, normalization, sort, summary all inline in useEffect. To test
 *   that logic you must render the component, mock fetch, trigger effect, assert state.
 * - Refactored: Pure functions in dashboardLogic.ts (unit-testable); custom hook
 *   useDashboardData (effect orchestration only, testable with renderHook); thin component.
 */
export function EffectLogicTestabilityDemo() {
  const [section, setSection] = useState<Section>('heavy')

  return (
    <main className="effect-logic-demo">
      <header className="effect-logic-demo__header">
        <h1>Effect logic and testability</h1>
        <p className="effect-logic-demo__subtitle">
          <strong>Problem:</strong> Business logic inside useEffect is hard to unit test (you must render, mock fetch, trigger effect). <strong>Refactor:</strong> Extract logic into pure functions (unit-test without React) and effect orchestration into a custom hook (test with renderHook). Component stays thin.
        </p>
        <div className="effect-logic-demo__tabs">
          <button
            type="button"
            className={section === 'heavy' ? 'active' : ''}
            onClick={() => setSection('heavy')}
          >
            Heavy logic in useEffect
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (pure + hook)
          </button>
        </div>
      </header>

      <section className="effect-logic-demo__concepts">
        <h2>Separation of concerns</h2>
        <ul>
          <li><strong>Effect orchestration:</strong> When to run (deps), cleanup, loading/error state. Lives in useEffect or a custom hook.</li>
          <li><strong>Business logic:</strong> Validate, normalize, sort, compute summary. Should live in pure functions (same input → same output; no side effects). Unit-test without React.</li>
          <li><strong>Component:</strong> Holds UI state (e.g. filters), calls hook, renders. Thin; easy to test or snapshot.</li>
        </ul>
      </section>

      {section === 'heavy' && <HeavyLogicInEffect />}
      {section === 'refactored' && <RefactoredPureAndHook />}
    </main>
  )
}
