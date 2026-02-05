import { useState } from 'react'
import { UnnecessaryUseMemo } from './UnnecessaryUseMemo'
import { BetterWithoutUseMemo } from './BetterWithoutUseMemo'
import { JustifiedUseMemo } from './JustifiedUseMemo'
import { UnstableDepsUseMemo } from './UnstableDepsUseMemo'
import { DashboardUseMemoCost } from './DashboardUseMemoCost'
import './use-memo-cost-demo.css'

type Section = 'dashboard' | 'unnecessary' | 'better' | 'justified' | 'unstable'

/**
 * Demo: when useMemo makes an app slower instead of faster.
 *
 * - Cost of memoization: dep comparison every render, storage of prev deps + result.
 * - Unnecessary useMemo: cheap computation, no consumer that needs stable ref → overhead with no benefit.
 * - Better without useMemo: same scenario, just compute in render → no memo overhead.
 * - Justified useMemo: expensive computation + memoized child → useMemo prevents recompute and child re-render.
 * - Unstable deps: useMemo with deps that change every render (e.g. inline object) → recompute every time + comparison → nullifies memoization; worse than no useMemo.
 */
export function UseMemoCostDemo() {
  const [section, setSection] = useState<Section>('dashboard')

  return (
    <main className="memo-cost-demo">
      <header className="memo-cost-demo__header">
        <h1>When useMemo makes an app slower</h1>
        <p className="memo-cost-demo__subtitle">
          useMemo has a <strong>cost</strong>: dep comparison every render and storage of previous deps + result. When the computation is cheap and nothing needs a stable reference, useMemo adds overhead with no benefit. When deps are unstable (new object/array every render), we recompute every time and never use the cache — strictly worse than no useMemo. Use useMemo only when you have expensive computation or a memoized consumer that needs a stable ref.
        </p>
        <div className="memo-cost-demo__tabs">
          <button
            type="button"
            className={section === 'dashboard' ? 'active' : ''}
            onClick={() => setSection('dashboard')}
          >
            Dashboard (measure)
          </button>
          <button
            type="button"
            className={section === 'unnecessary' ? 'active' : ''}
            onClick={() => setSection('unnecessary')}
          >
            Unnecessary useMemo
          </button>
          <button
            type="button"
            className={section === 'better' ? 'active' : ''}
            onClick={() => setSection('better')}
          >
            Better without useMemo
          </button>
          <button
            type="button"
            className={section === 'justified' ? 'active' : ''}
            onClick={() => setSection('justified')}
          >
            Justified useMemo
          </button>
          <button
            type="button"
            className={section === 'unstable' ? 'active' : ''}
            onClick={() => setSection('unstable')}
          >
            Unstable deps
          </button>
        </div>
      </header>

      <section className="memo-cost-demo__concepts">
        <h2>Cost and when to use</h2>
        <ul>
          <li>
            <strong>Cost of memoization:</strong> Every render, React compares previous deps with current (Object.is). If same, return cached value (no factory run). If different, run factory and store result. So we always pay comparison; we sometimes pay factory. Storage: prev deps + result.
          </li>
          <li>
            <strong>Unnecessary useMemo:</strong> Cheap computation (e.g. return constant object) and no consumer that needs stable ref (no memoized child, no effect deps). We pay comparison + storage for no benefit. Just compute in render.
          </li>
          <li>
            <strong>Justified useMemo:</strong> Expensive computation and/or a memoized consumer that receives the value. When deps are stable, we skip recompute and pass same ref → child skips re-render. Real performance win.
          </li>
          <li>
            <strong>Unstable deps:</strong> Deps that change every render (e.g. inline <code>{`{ theme: 'dark' }`}</code>) → we recompute every time and never use the cache. We pay comparison + factory every time — worse than no useMemo (we&apos;d just run the factory in render without comparison).
          </li>
          <li>
            <strong>When NOT to optimize:</strong> Don&apos;t use useMemo &quot;just in case.&quot; Profile first. Use useMemo when you have measured a problem (expensive computation or memoized child re-rendering unnecessarily) and stable deps.
          </li>
        </ul>
      </section>

      {section === 'dashboard' && <DashboardUseMemoCost />}
      {section === 'unnecessary' && <UnnecessaryUseMemo />}
      {section === 'better' && <BetterWithoutUseMemo />}
      {section === 'justified' && <JustifiedUseMemo />}
      {section === 'unstable' && <UnstableDepsUseMemo />}
    </main>
  )
}
