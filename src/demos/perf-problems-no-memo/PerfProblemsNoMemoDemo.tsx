import { useState } from 'react'
import { HeavyComputationProblem } from './HeavyComputationProblem'
import { HeavyComputationTryMemo } from './HeavyComputationTryMemo'
import { HeavyComputationCorrect } from './HeavyComputationCorrect'
import { LargeDOMProblem } from './LargeDOMProblem'
import { LargeDOMTryMemo } from './LargeDOMTryMemo'
import { LargeDOMCorrect } from './LargeDOMCorrect'
import { PoorStateProblem } from './PoorStateProblem'
import { PoorStateTryMemo } from './PoorStateTryMemo'
import { PoorStateCorrect } from './PoorStateCorrect'
import './perf-problems-demo.css'

type Scenario = 'heavy' | 'large' | 'state'
type SubTab = 'problem' | 'try-memo' | 'correct'

/**
 * Demo: Performance problems memoization cannot fix.
 *
 * 1. Heavy computation in render: filter over 8k items on every keystroke.
 *    Memo doesn't help (props change every time). Fix: useDeferredValue + useMemo.
 * 2. Large DOM tree: 2000 list items. Memo doesn't reduce DOM nodes.
 *    Fix: virtualization (render only visible window).
 * 3. Poor state architecture: all state at top, full tree re-renders.
 *    Memo + useCallback can band-aid; fix: colocate state.
 */
export function PerfProblemsNoMemoDemo() {
  const [scenario, setScenario] = useState<Scenario>('heavy')
  const [subTab, setSubTab] = useState<SubTab>('problem')

  return (
    <main className="perf-problems-demo">
      <header className="perf-problems-demo__header">
        <h1>Performance problems memo cannot fix</h1>
        <p className="perf-problems-demo__subtitle">
          A dashboard-style demo: heavy computation in render, large DOM trees, and poor state
          architecture. Each scenario shows Problem → Try memo (fails) → Correct fix (not memo).
        </p>
        <div className="perf-problems-demo__tabs">
          <button
            type="button"
            className={scenario === 'heavy' ? 'active' : ''}
            onClick={() => setScenario('heavy')}
          >
            1. Heavy computation
          </button>
          <button
            type="button"
            className={scenario === 'large' ? 'active' : ''}
            onClick={() => setScenario('large')}
          >
            2. Large DOM
          </button>
          <button
            type="button"
            className={scenario === 'state' ? 'active' : ''}
            onClick={() => setScenario('state')}
          >
            3. Poor state
          </button>
        </div>
      </header>

      <section className="perf-problems-demo__concepts">
        <h2>When memo is the wrong tool</h2>
        <ul>
          <li>
            <strong>Heavy work in render:</strong> Memo skips re-renders when props are equal; it
            doesn’t move work off the critical path. Fix: useDeferredValue, useMemo (cache derived
            data), or move work to a worker.
          </li>
          <li>
            <strong>Too many DOM nodes:</strong> Memo doesn’t reduce the number of components or
            nodes; it only avoids re-renders. Fix: virtualize (render only visible items).
          </li>
          <li>
            <strong>State too high:</strong> Memo + useCallback can reduce re-renders but add
            complexity and are fragile. Fix: colocate state so only the component that changed
            re-renders.
          </li>
        </ul>
      </section>

      <div className="perf-scenario__sub-tabs">
        <button
          type="button"
          className={subTab === 'problem' ? 'active' : ''}
          onClick={() => setSubTab('problem')}
        >
          Problem
        </button>
        <button
          type="button"
          className={subTab === 'try-memo' ? 'active' : ''}
          onClick={() => setSubTab('try-memo')}
        >
          Try memo (fails)
        </button>
        <button
          type="button"
          className={subTab === 'correct' ? 'active' : ''}
          onClick={() => setSubTab('correct')}
        >
          Correct fix
        </button>
      </div>

      {scenario === 'heavy' && subTab === 'problem' && <HeavyComputationProblem />}
      {scenario === 'heavy' && subTab === 'try-memo' && <HeavyComputationTryMemo />}
      {scenario === 'heavy' && subTab === 'correct' && <HeavyComputationCorrect />}

      {scenario === 'large' && subTab === 'problem' && <LargeDOMProblem />}
      {scenario === 'large' && subTab === 'try-memo' && <LargeDOMTryMemo />}
      {scenario === 'large' && subTab === 'correct' && <LargeDOMCorrect />}

      {scenario === 'state' && subTab === 'problem' && <PoorStateProblem />}
      {scenario === 'state' && subTab === 'try-memo' && <PoorStateTryMemo />}
      {scenario === 'state' && subTab === 'correct' && <PoorStateCorrect />}
    </main>
  )
}
