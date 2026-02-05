import { useState } from 'react'
import { CounterWithState } from './CounterWithState'
import { CounterWithRef } from './CounterWithRef'
import { CorrectRefUsage } from './CorrectRefUsage'
import { WrongRefUsage } from './WrongRefUsage'
import './ref-vs-state-demo.css'

type Section =
  | 'state-vs-ref'
  | 'correct-ref'
  | 'wrong-ref'

/**
 * Demo: why useRef does not trigger re-render, while useState does.
 *
 * - useState: setState() tells React state changed → React schedules a re-render →
 *   component function runs again with new state → new render snapshot → UI updates.
 * - useRef: ref.current = x mutates a box that persists across renders but does NOT
 *   tell React to re-render → no new render snapshot → UI does not update.
 *
 * Open console to see [render] logs: state path re-renders on each increment;
 * ref path does not re-render when only ref is mutated.
 */
export function RefVsStateDemo() {
  const [section, setSection] = useState<Section>('state-vs-ref')

  return (
    <main className="ref-demo">
      <header className="ref-demo__header">
        <h1>useRef vs useState: re-render</h1>
        <p className="ref-demo__subtitle">
          <strong>useState</strong> participates in the render cycle: <code>setState</code> schedules
          a re-render; the component runs again with new state; the UI reflects it.{' '}
          <strong>useRef</strong> persists a value across renders but mutating <code>ref.current</code>{' '}
          does <em>not</em> schedule a re-render — no new render snapshot, so the UI does not update.
        </p>
        <div className="ref-demo__tabs">
          <button
            type="button"
            className={section === 'state-vs-ref' ? 'active' : ''}
            onClick={() => setSection('state-vs-ref')}
          >
            State vs Ref
          </button>
          <button
            type="button"
            className={section === 'correct-ref' ? 'active' : ''}
            onClick={() => setSection('correct-ref')}
          >
            Correct: ref (interval ID)
          </button>
          <button
            type="button"
            className={section === 'wrong-ref' ? 'active' : ''}
            onClick={() => setSection('wrong-ref')}
          >
            Bug: ref as state
          </button>
        </div>
      </header>

      <section className="ref-demo__concepts">
        <h2>Concepts</h2>
        <ul>
          <li>
            <strong>useState</strong> — Changing state via <code>setState</code> tells React the
            component&apos;s output may have changed. React schedules a re-render; the component
            function runs again with the new state; that run produces a new render snapshot; React
            commits it to the DOM. So state changes participate in the render cycle.
          </li>
          <li>
            <strong>useRef</strong> — A ref is a mutable box that persists across renders. Updating <code>ref.current</code> does <em>not</em> tell React to re-render. The component
            function does not run again; there is no new render snapshot; the UI does not update.
            Use refs for values that must persist but should not drive UI (e.g. interval ID, DOM ref).
          </li>
          <li>
            <strong>When to use ref</strong> — Store something you need to read/write across renders
            or in callbacks (e.g. interval ID for cleanup, DOM node, previous value for comparison)
            that should <em>not</em> trigger a re-render when it changes.
          </li>
          <li>
            <strong>When not to use ref</strong> — Do not store data that must be shown to the user
            in a ref. If the UI should update when the value changes, use state so React schedules
            a re-render.
          </li>
        </ul>
      </section>

      {section === 'state-vs-ref' && (
        <div className="ref-demo__cards">
          <CounterWithState />
          <CounterWithRef />
        </div>
      )}
      {section === 'correct-ref' && <CorrectRefUsage />}
      {section === 'wrong-ref' && <WrongRefUsage />}
    </main>
  )
}
