import { useState } from 'react'
import { UnstableDepsBug } from './UnstableDepsBug'
import { StableDepsRefactored } from './StableDepsRefactored'
import { NoEffectRefactored } from './NoEffectRefactored'
import './effect-deps-identity-demo.css'

type Section = 'unstable' | 'stable' | 'no-effect'

/**
 * Demo: why useEffect re-runs even when dependencies "look" unchanged.
 *
 * React compares dependencies with Object.is (reference equality). Objects, arrays, and functions
 * created inline or derived every render have a new identity each time — so Object.is(prev, next)
 * is false → effect re-runs. useMemo/useCallback stabilize references; or remove the effect and
 * use an event handler / derived state.
 */
export function EffectDepsIdentityDemo() {
  const [section, setSection] = useState<Section>('unstable')

  return (
    <main className="identity-demo">
      <header className="identity-demo__header">
        <h1>useEffect re-runs when deps look unchanged</h1>
        <p className="identity-demo__subtitle">
          React compares effect dependencies with <strong>Object.is</strong> (reference equality).
          A new <code>{`{}`}</code> or <code>{`() => {}`}</code> every render → new reference → &quot;changed&quot; → effect re-runs.
          Values may look the same; <strong>identity</strong> is different. Stabilize with useMemo/useCallback, or remove the effect.
        </p>
        <div className="identity-demo__tabs">
          <button
            type="button"
            className={section === 'unstable' ? 'active' : ''}
            onClick={() => setSection('unstable')}
          >
            Unstable deps (bug)
          </button>
          <button
            type="button"
            className={section === 'stable' ? 'active' : ''}
            onClick={() => setSection('stable')}
          >
            Stable deps (useMemo/useCallback)
          </button>
          <button
            type="button"
            className={section === 'no-effect' ? 'active' : ''}
            onClick={() => setSection('no-effect')}
          >
            No effect (event handler)
          </button>
        </div>
      </header>

      <section className="identity-demo__concepts">
        <h2>Reference identity and dependency comparison</h2>
        <ul>
          <li>
            <strong>How React decides:</strong> After commit, React compares each dependency with its previous value using <code>Object.is</code>. If any comparison is false, the previous effect&apos;s cleanup runs, then the effect runs again.
          </li>
          <li>
            <strong>Object.is for objects/functions:</strong> Same reference → true. New <code>{`{}`}</code>, <code>[]</code>, or <code>{`() => {}`}</code> every render → new reference → false → effect re-runs.
          </li>
          <li>
            <strong>Derived values:</strong> <code>{`const config = { theme: 'dark', count }`}</code> creates a new object every render (count or not). Putting config in deps → effect re-runs every time. Same for arrays and functions created in render.
          </li>
          <li>
            <strong>Stabilize:</strong> useMemo for objects/arrays (same reference until their deps change). useCallback for functions. Or <strong>remove the effect</strong>: if the sync is &quot;when user clicks Apply&quot;, use an event handler — no effect, no deps.
          </li>
        </ul>
      </section>

      {section === 'unstable' && <UnstableDepsBug />}
      {section === 'stable' && <StableDepsRefactored />}
      {section === 'no-effect' && <NoEffectRefactored />}
    </main>
  )
}
