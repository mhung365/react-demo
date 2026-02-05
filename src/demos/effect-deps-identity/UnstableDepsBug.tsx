import { useState, useEffect } from 'react'
import { useDepsCompareLog } from './useDepsCompareLog'
import './effect-deps-identity-demo.css'

/**
 * BUG: Effect dependencies "look" unchanged but effect re-runs every time.
 *
 * - config: inline object { theme: 'dark' } — new reference every render.
 * - onComplete: inline function () => {} — new reference every render.
 *
 * React compares deps with Object.is (reference equality). New object !== previous object,
 * new function !== previous function. So effect re-runs on every render even though the
 * "values" (theme: 'dark', same callback behavior) look the same.
 *
 * Derived values (e.g. config = { theme, count }) also create new references every render
 * when count or other state changes.
 */
export function UnstableDepsBug() {
  const [count, setCount] = useState(0)
  const [effectRunCount, setEffectRunCount] = useState(0)

  // New object every render — reference identity changes
  const config = { theme: 'dark' as const, count }
  // New function every render — reference identity changes
  const onComplete = () => {
    console.log('onComplete called')
  }

  useEffect(() => {
    setEffectRunCount((n) => n + 1)
    console.log(
      `[UnstableDepsBug] effect ran. config.theme=${config.theme}, config.count=${config.count}. ` +
        `config and onComplete are new references every render → effect re-runs every time.`
    )
  }, [config, onComplete])

  useDepsCompareLog('UnstableDepsBug', [config, onComplete], ['config', 'onComplete'])

  return (
    <section className="identity-demo-card identity-demo-card--wrong">
      <header className="identity-demo-card__header">
        <h3>Broken: unstable dependencies</h3>
        <p>
          Effect deps: <code>[config, onComplete]</code>. <code>config</code> = <code>{`{ theme: 'dark', count }`}</code> (new object every render).
          <code> onComplete</code> = <code>{`() => {}`}</code> (new function every render). React compares with <strong>Object.is</strong> — new reference → &quot;changed&quot; → effect re-runs. Values look the same; identity is different.
        </p>
      </header>
      <div className="identity-demo-card__row">
        <span className="identity-demo-card__label">Count (triggers re-render):</span>
        <strong>{count}</strong>
      </div>
      <div className="identity-demo-card__row">
        <span className="identity-demo-card__label">Effect run count:</span>
        <strong className="identity-demo-card__value">{effectRunCount}</strong>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
      <p className="identity-demo-card__hint identity-demo-card__hint--wrong">
        Each click → re-render → new config and onComplete references → effect re-runs. Check console: &quot;same=false (ref equal=false)&quot;.
      </p>
    </section>
  )
}
