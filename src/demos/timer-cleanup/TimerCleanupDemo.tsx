import { useState } from 'react'
import { PollingNoCleanupBroken } from './PollingNoCleanupBroken'
import { PollingWithCleanupCorrect } from './PollingWithCleanupCorrect'
import { AlternativeNoInterval } from './AlternativeNoInterval'
import './timer-cleanup-demo.css'

type Section = 'broken' | 'correct' | 'alternative'

/**
 * Demo: Bugs when setInterval/setTimeout are not cleaned up in React.
 *
 * - Broken: setInterval with no cleanup → intervals stack on remount; setState after unmount.
 *   Stale closure: interval callback captures refreshCount from closure (log shows stale value).
 * - Correct: clearInterval in cleanup; use ref for latest value in callback.
 * - Alternative: No setInterval — recursive setTimeout (one timer at a time) or React Query refetchInterval.
 */
export function TimerCleanupDemo() {
  const [section, setSection] = useState<Section>('broken')

  return (
    <main className="timer-cleanup-demo">
      <header className="timer-cleanup-demo__header">
        <h1>Timer cleanup in React</h1>
        <p className="timer-cleanup-demo__subtitle">
          <strong>Missing cleanup:</strong> setInterval keeps running after unmount → setState on unmounted component (warning). On remount, a new interval starts → intervals stack (multiple ticks per period). <strong>Stale closure:</strong> callback captures state from when the effect ran; use a ref for latest value. <strong>Fix:</strong> clearInterval in cleanup; or use recursive setTimeout / React Query refetchInterval.
        </p>
        <div className="timer-cleanup-demo__tabs">
          <button
            type="button"
            className={section === 'broken' ? 'active' : ''}
            onClick={() => setSection('broken')}
          >
            Broken (no cleanup + stale)
          </button>
          <button
            type="button"
            className={section === 'correct' ? 'active' : ''}
            onClick={() => setSection('correct')}
          >
            Correct (cleanup + ref)
          </button>
          <button
            type="button"
            className={section === 'alternative' ? 'active' : ''}
            onClick={() => setSection('alternative')}
          >
            Alternative (no setInterval)
          </button>
        </div>
      </header>

      <section className="timer-cleanup-demo__concepts">
        <h2>Intervals stacking and stale closures</h2>
        <ul>
          <li><strong>Stacking:</strong> Without cleanup, each time the effect runs (mount or deps change) we start a new interval. The old one keeps running. So we get N intervals firing every period. Switch demo tab and back to see multiple ticks per 2s.</li>
          <li><strong>setState after unmount:</strong> When the component unmounts, the interval keeps firing and calls setState → React warning and possible leaks. Cleanup must clear the interval.</li>
          <li><strong>Stale closure:</strong> The interval callback closes over state from when the effect ran. To read the latest value inside the callback, use a ref (ref.current = value in effect body; callback reads ref.current).</li>
        </ul>
      </section>

      {section === 'broken' && <PollingNoCleanupBroken />}
      {section === 'correct' && <PollingWithCleanupCorrect />}
      {section === 'alternative' && <AlternativeNoInterval />}
    </main>
  )
}
