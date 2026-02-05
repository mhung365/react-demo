import { useState, useEffect } from 'react'
import { DashboardBaseline } from './DashboardBaseline'
import { DashboardWrongOptimization } from './DashboardWrongOptimization'
import { DashboardRightOptimization } from './DashboardRightOptimization'
import { resetDashboardCounts } from './useDashboardRenderCount'
import './optimization-decision-demo.css'

type Tab = 'baseline' | 'wrong' | 'right'

/**
 * Demo: How Senior developers decide when to optimize rendering and when to ignore re-renders.
 *
 * - Baseline: Enterprise dashboard with multiple re-render scenarios; classify harmless /
 *   tolerable / must-fix.
 * - Wrong optimization: Memoize cheap components (Header, Sidebar, widgets); expensive chart
 *   still re-renders; more code, no user impact.
 * - Right optimization: Colocate tick state in TeamC so only TeamC re-renders on tick; focused
 *   fix with real user impact.
 */
export function OptimizationDecisionDemo() {
  const [tab, setTab] = useState<Tab>('baseline')

  useEffect(() => {
    resetDashboardCounts()
  }, [tab])

  return (
    <main className="opt-decision">
      <header className="opt-decision__header">
        <h1>When to optimize rendering (decision framework)</h1>
        <p className="opt-decision__subtitle">
          Enterprise-style dashboard: multiple re-render scenarios across the app. Classify as
          harmless / tolerable / must-fix. See why optimizing the wrong layer causes more
          problems and how a focused optimization delivers real impact.
        </p>
        <div className="opt-decision__tabs">
          <button
            type="button"
            className={tab === 'baseline' ? 'active' : ''}
            onClick={() => setTab('baseline')}
          >
            Baseline
          </button>
          <button
            type="button"
            className={tab === 'wrong' ? 'active' : ''}
            onClick={() => setTab('wrong')}
          >
            Wrong optimization (rejected)
          </button>
          <button
            type="button"
            className={tab === 'right' ? 'active' : ''}
            onClick={() => setTab('right')}
          >
            Right optimization (accepted)
          </button>
        </div>
      </header>

      <section className="opt-decision__criteria">
        <h2>Decision criteria: harmless vs tolerable vs must-fix</h2>
        <table>
          <thead>
            <tr>
              <th>Classification</th>
              <th>Meaning</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge badge--harmless">Harmless</span></td>
              <td>Cheap component (simple DOM, no heavy work). Re-renders often but no user-visible cost.</td>
              <td>Ignore; do not optimize.</td>
            </tr>
            <tr>
              <td><span className="badge badge--tolerable">Tolerable</span></td>
              <td>Moderate cost (e.g. small list). Re-renders may be frequent but not in critical path.</td>
              <td>Monitor; optimize only if profiling shows it in hot path.</td>
            </tr>
            <tr>
              <td><span className="badge badge--must-fix">Must-fix</span></td>
              <td>Expensive component (heavy render work). Re-renders cause jank or frame drops.</td>
              <td>Fix: colocate state, memo + stable props, or move work off critical path.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {tab === 'baseline' && <DashboardBaseline />}
      {tab === 'wrong' && <DashboardWrongOptimization />}
      {tab === 'right' && <DashboardRightOptimization />}
    </main>
  )
}
