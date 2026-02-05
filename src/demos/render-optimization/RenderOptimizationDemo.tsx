import { useState } from 'react'
import { DashboardHarmless } from './DashboardHarmless'
import { DashboardWithProblem } from './DashboardWithProblem'
import { DashboardOptimized } from './DashboardOptimized'
import { DashboardPremature } from './DashboardPremature'
import { DashboardDebugFalsePositive } from './DashboardDebugFalsePositive'
import { DashboardDebugRealBottleneck } from './DashboardDebugRealBottleneck'
import { DashboardDebugWrongOptimization } from './DashboardDebugWrongOptimization'
import { DashboardDebugCorrectOptimization } from './DashboardDebugCorrectOptimization'
import './render-optimization-demo.css'

type Section =
  | 'harmless'
  | 'problem'
  | 'optimized'
  | 'premature'
  | 'debug-false-positive'
  | 'debug-real-bottleneck'
  | 'debug-wrong-opt'
  | 'debug-correct-opt'

/**
 * Demo: When to optimize React rendering + how to debug/measure in production.
 *
 * Part 1: Harmless / Problem / Optimized / Premature (when to optimize).
 * Part 2: Debug & measure — render counters, Profiler, false positive, wrong vs correct optimization.
 */
export function RenderOptimizationDemo() {
  const [section, setSection] = useState<Section>('harmless')

  return (
    <main className="render-opt-demo">
      <header className="render-opt-demo__header">
        <h1>When to optimize React rendering</h1>
        <p className="render-opt-demo__subtitle">
          Not every re-render is a problem. This demo shows <strong>render noise</strong> (harmless)
          vs <strong>render problems</strong> (real jank), when optimization is justified, and the
          cost of <strong>premature optimization</strong>. The <strong>Debug & measure</strong> tabs
          show render counters, Profiler-based analysis, false positives, and wrong vs correct fixes.
        </p>
        <div className="render-opt-demo__tabs">
          <button
            type="button"
            className={section === 'harmless' ? 'active' : ''}
            onClick={() => setSection('harmless')}
          >
            Harmless re-renders
          </button>
          <button
            type="button"
            className={section === 'problem' ? 'active' : ''}
            onClick={() => setSection('problem')}
          >
            Real problem (jank)
          </button>
          <button
            type="button"
            className={section === 'optimized' ? 'active' : ''}
            onClick={() => setSection('optimized')}
          >
            Optimized (justified)
          </button>
          <button
            type="button"
            className={section === 'premature' ? 'active' : ''}
            onClick={() => setSection('premature')}
          >
            Premature optimization
          </button>
          <button
            type="button"
            className={section === 'debug-false-positive' ? 'active' : ''}
            onClick={() => setSection('debug-false-positive')}
          >
            Debug: False positive
          </button>
          <button
            type="button"
            className={section === 'debug-real-bottleneck' ? 'active' : ''}
            onClick={() => setSection('debug-real-bottleneck')}
          >
            Debug: Real bottleneck
          </button>
          <button
            type="button"
            className={section === 'debug-wrong-opt' ? 'active' : ''}
            onClick={() => setSection('debug-wrong-opt')}
          >
            Debug: Wrong optimization
          </button>
          <button
            type="button"
            className={section === 'debug-correct-opt' ? 'active' : ''}
            onClick={() => setSection('debug-correct-opt')}
          >
            Debug: Correct optimization
          </button>
        </div>
      </header>

      <section className="render-opt-demo__concepts">
        <h2>How to tell render noise from render problems</h2>
        <ul>
          <li>
            <strong>Render noise:</strong> Many <code>[render]</code> logs, but each render is cheap (&lt;1ms).
            No user-visible lag. Don’t optimize — memo/useMemo add overhead with no gain.
          </li>
          <li>
            <strong>Render problem:</strong> One or more components do heavy work during render (e.g. filter/sort
            large list, complex computation). <code>[measure]</code> or <strong>Profiler</strong> shows 10ms+ per
            component → jank. Optimize: memo + stable props, or move state down.
          </li>
          <li>
            <strong>Debug & measure:</strong> Use <strong>render counters</strong> to see who re-renders; use{' '}
            <strong>React DevTools Profiler</strong> (or the in-app Profiler panel) for <em>actual duration</em>.
            High counts alone are a false positive; optimize only when Profiler shows a slow component.
          </li>
        </ul>
      </section>

      {section === 'harmless' && <DashboardHarmless />}
      {section === 'problem' && <DashboardWithProblem />}
      {section === 'optimized' && <DashboardOptimized />}
      {section === 'premature' && <DashboardPremature />}
      {section === 'debug-false-positive' && <DashboardDebugFalsePositive />}
      {section === 'debug-real-bottleneck' && <DashboardDebugRealBottleneck />}
      {section === 'debug-wrong-opt' && <DashboardDebugWrongOptimization />}
      {section === 'debug-correct-opt' && <DashboardDebugCorrectOptimization />}
    </main>
  )
}
