import { useState } from 'react'
import { useLifecycleLog } from './useLifecycleLog'
import './effect-lifecycle-demo.css'

/**
 * Minimal demo: exact order of render → commit → effect, and on re-render:
 * cleanup (previous effect) → effect (new run).
 *
 * Click "Increment" to change state. You'll see:
 * - First mount: 1. render → 2. commit → 3. effect ran
 * - After click: 1. render → 2b. layout cleanup → 2. commit → 3b. effect cleanup → 3. effect ran
 */
export function EffectOrderDemo() {
  const [count, setCount] = useState(0)
  useLifecycleLog('EffectOrderDemo', [count])

  return (
    <section className="effect-demo-card effect-demo-card--order">
      <header className="effect-demo-card__header">
        <h3>Exact order: render → commit → effect</h3>
        <p>
          Count: <strong>{count}</strong>. Effect depends on <code>[count]</code>.
          Open console. First mount: render → commit → effect. Click Increment: render → cleanup → effect.
        </p>
      </header>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
      <p className="effect-demo-card__hint">
        Watch console: on each click you see <strong>effect cleanup</strong> (previous run) then <strong>effect ran</strong> (new run).
      </p>
    </section>
  )
}
