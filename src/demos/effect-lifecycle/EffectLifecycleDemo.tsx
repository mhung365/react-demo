import { useState } from 'react'
import { EffectOrderDemo } from './EffectOrderDemo'
import { CorrectEffect } from './CorrectEffect'
import { BrokenEffect } from './BrokenEffect'
import { UnmountDemo } from './UnmountDemo'
import './effect-lifecycle-demo.css'

type Section = 'order' | 'correct' | 'broken' | 'unmount'

/**
 * Demo: when useEffect runs, and when its cleanup runs.
 *
 * Lifecycle: render (component function) → commit (DOM updated) → useLayoutEffect → paint → useEffect.
 * Cleanup: before the next effect run (same effect, deps changed) or on unmount.
 *
 * Open console to see exact order: 1. render → 2. commit → 3. effect ran;
 * on re-render/dep change: 3b. effect cleanup → 3. effect ran.
 */
export function EffectLifecycleDemo() {
  const [section, setSection] = useState<Section>('order')

  return (
    <main className="effect-demo">
      <header className="effect-demo__header">
        <h1>useEffect: when it runs, when cleanup runs</h1>
        <p className="effect-demo__subtitle">
          <strong>Render</strong> = component function ran. <strong>Commit</strong> = React updated the DOM (useLayoutEffect runs after).{' '}
          <strong>Effect</strong> = useEffect runs after paint. <strong>Cleanup</strong> runs before the next effect run (deps changed) or on unmount.
        </p>
        <div className="effect-demo__tabs">
          <button
            type="button"
            className={section === 'order' ? 'active' : ''}
            onClick={() => setSection('order')}
          >
            Order
          </button>
          <button
            type="button"
            className={section === 'correct' ? 'active' : ''}
            onClick={() => setSection('correct')}
          >
            Correct effect + cleanup
          </button>
          <button
            type="button"
            className={section === 'broken' ? 'active' : ''}
            onClick={() => setSection('broken')}
          >
            Broken (no cleanup)
          </button>
          <button
            type="button"
            className={section === 'unmount' ? 'active' : ''}
            onClick={() => setSection('unmount')}
          >
            Unmount cleanup
          </button>
        </div>
      </header>

      <section className="effect-demo__concepts">
        <h2>Lifecycle</h2>
        <ul>
          <li>
            <strong>When does useEffect run?</strong> After React commits to the DOM and the browser has painted. So: render → commit (DOM updated) → useLayoutEffect (runs after commit) → paint → useEffect.
          </li>
          <li>
            <strong>When does cleanup run?</strong> (1) Before the <em>next</em> run of the same effect (when deps change). (2) On unmount. Order: cleanup of previous effect runs, then (if deps changed) the new effect runs. On unmount, only cleanup runs.
          </li>
          <li>
            <strong>Re-render / dep change:</strong> Component runs again (render) → commit → previous effect&apos;s cleanup → new effect (if deps changed).
          </li>
          <li>
            <strong>Unmount:</strong> Component is removed from the tree → React runs effect cleanup (and layout cleanup). No new effect.
          </li>
        </ul>
      </section>

      {section === 'order' && <EffectOrderDemo />}
      {section === 'correct' && <CorrectEffect />}
      {section === 'broken' && <BrokenEffect />}
      {section === 'unmount' && <UnmountDemo />}
    </main>
  )
}
