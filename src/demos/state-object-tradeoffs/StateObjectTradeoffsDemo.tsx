import { useState } from 'react'
import { SingleStateObject } from './SingleStateObject'
import { MultipleUseState } from './MultipleUseState'
import { RefactoredClear } from './RefactoredClear'
import { WhenGroupingBeneficial } from './WhenGroupingBeneficial'
import './state-object-tradeoffs-demo.css'

type TabId = 'single' | 'multiple' | 'refactored' | 'beneficial'

/**
 * Demo: Trade-offs of grouping state into one object vs multiple useState.
 * - Single object: new reference every update → children re-render, useEffect([state]) runs every time.
 * - Multiple useState: children receive only needed props → fewer re-renders; effect deps are primitives.
 * - Refactored: multiple useState + useMemo when we need one object (API, reset).
 * - When beneficial: one object justified for atomic reset and single consumer of whole object.
 */
export function StateObjectTradeoffsDemo() {
  const [tab, setTab] = useState<TabId>('single')

  return (
    <main className="so-demo">
      <header className="so-demo__header">
        <h1>State object vs multiple useState</h1>
        <p className="so-demo__subtitle">
          Grouping state into one object replaces the whole reference on every update → children receiving the object re-render every time; <code>useEffect([state])</code> runs on every update. Multiple <code>useState</code> lets you pass only the props each child needs and use primitive deps in effects. Open the console to see <code>[render]</code> and <code>[effect]</code> logs.
        </p>
        <div className="so-demo__tabs">
          <button
            type="button"
            className={tab === 'single' ? 'active' : ''}
            onClick={() => setTab('single')}
          >
            Single state object
          </button>
          <button
            type="button"
            className={tab === 'multiple' ? 'active' : ''}
            onClick={() => setTab('multiple')}
          >
            Multiple useState
          </button>
          <button
            type="button"
            className={tab === 'refactored' ? 'active' : ''}
            onClick={() => setTab('refactored')}
          >
            Refactored (clear structure)
          </button>
          <button
            type="button"
            className={tab === 'beneficial' ? 'active' : ''}
            onClick={() => setTab('beneficial')}
          >
            When grouping is beneficial
          </button>
        </div>
      </header>
      {tab === 'single' && <SingleStateObject />}
      {tab === 'multiple' && <MultipleUseState />}
      {tab === 'refactored' && <RefactoredClear />}
      {tab === 'beneficial' && <WhenGroupingBeneficial />}
    </main>
  )
}
