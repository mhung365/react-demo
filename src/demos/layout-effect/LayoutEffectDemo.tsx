import { useState } from 'react'
import { TimingOrderDemo } from './TimingOrderDemo'
import { PositionFlickerBug } from './PositionFlickerBug'
import { PositionFlickerFixed } from './PositionFlickerFixed'
import { BadUseLayoutEffect } from './BadUseLayoutEffect'
import './layout-effect-demo.css'

type Section = 'timing' | 'flicker-bug' | 'flicker-fixed' | 'bad'

/**
 * Demo: useEffect vs useLayoutEffect — timing and when to use useLayoutEffect.
 *
 * - useLayoutEffect: runs after DOM updates, BEFORE the browser paints. Synchronous; blocks paint.
 * - useEffect: runs after paint. Does not block.
 *
 * Use useLayoutEffect when you need to read layout (getBoundingClientRect, scroll) or mutate DOM
 * and need the result visible in the same paint (e.g. position a tooltip). Use useEffect for
 * everything else (fetch, subscribe, log) so you don't block painting.
 */
export function LayoutEffectDemo() {
  const [section, setSection] = useState<Section>('timing')

  return (
    <main className="layout-demo">
      <header className="layout-demo__header">
        <h1>useEffect vs useLayoutEffect</h1>
        <p className="layout-demo__subtitle">
          <strong>useLayoutEffect</strong> runs after React commits to the DOM but <strong>before the browser paints</strong>. It runs synchronously and blocks painting. Use it when you need to read layout (measure) or mutate DOM so the user never sees a wrong frame (e.g. position a tooltip). <strong>useEffect</strong> runs after paint; use it for fetch, subscribe, logging — don&apos;t block paint.
        </p>
        <div className="layout-demo__tabs">
          <button
            type="button"
            className={section === 'timing' ? 'active' : ''}
            onClick={() => setSection('timing')}
          >
            Timing order
          </button>
          <button
            type="button"
            className={section === 'flicker-bug' ? 'active' : ''}
            onClick={() => setSection('flicker-bug')}
          >
            useEffect flicker
          </button>
          <button
            type="button"
            className={section === 'flicker-fixed' ? 'active' : ''}
            onClick={() => setSection('flicker-fixed')}
          >
            useLayoutEffect fix
          </button>
          <button
            type="button"
            className={section === 'bad' ? 'active' : ''}
            onClick={() => setSection('bad')}
          >
            Bad useLayoutEffect
          </button>
        </div>
      </header>

      <section className="layout-demo__concepts">
        <h2>Timing and when to use which</h2>
        <ul>
          <li>
            <strong>Order:</strong> Render → commit (DOM updated) → <strong>useLayoutEffect</strong> (synchronous, before paint) → browser paint → <strong>useEffect</strong> (after paint).
          </li>
          <li>
            <strong>useLayoutEffect blocks painting:</strong> The browser cannot paint until useLayoutEffect (and any synchronous state updates it triggers) complete. Keep it fast. Use for: measure DOM (getBoundingClientRect), scroll position, or DOM mutations that must be visible in the first paint (e.g. position tooltip).
          </li>
          <li>
            <strong>useEffect does not block:</strong> Runs after paint. Use for: fetch, subscriptions, logging, or any side effect that doesn&apos;t need to change what the user sees in the first frame.
          </li>
          <li>
            <strong>Visual bug (flicker):</strong> If you measure and set state in useEffect, the first paint shows wrong layout; then effect runs, setState, second paint shows correct layout → flicker. Do the measure + setState in useLayoutEffect so the first paint is correct.
          </li>
          <li>
            <strong>When NOT to use useLayoutEffect:</strong> Don&apos;t use it for fetch, subscribe, or heavy work — you block the first paint and the UI feels janky. Use useEffect.
          </li>
        </ul>
      </section>

      {section === 'timing' && <TimingOrderDemo />}
      {section === 'flicker-bug' && <PositionFlickerBug />}
      {section === 'flicker-fixed' && <PositionFlickerFixed />}
      {section === 'bad' && <BadUseLayoutEffect />}
    </main>
  )
}
