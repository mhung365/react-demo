import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDepsCompareLog } from './useDepsCompareLog'
import './effect-deps-identity-demo.css'

/**
 * REFACTORED: Stabilize dependencies with useMemo and useCallback.
 *
 * - config: useMemo(() => ({ theme: 'dark' }), []) — same reference across renders (unless deps change).
 * - onComplete: useCallback(() => {}, []) — same function reference.
 *
 * React compares deps with Object.is. Same reference → "unchanged" → effect does not re-run.
 * Effect runs once on mount (or when we intentionally change a memo/callback dep).
 */
export function StableDepsRefactored() {
  const [count, setCount] = useState(0)
  const [effectRunCount, setEffectRunCount] = useState(0)

  const config = useMemo(() => ({ theme: 'dark' as const }), [])
  const onComplete = useCallback(() => {
    console.log('onComplete called')
  }, [])

  useEffect(() => {
    setEffectRunCount((n) => n + 1)
    console.log(
      `[StableDepsRefactored] effect ran. config.theme=${config.theme}. ` +
        `config and onComplete are stable (useMemo/useCallback) → effect runs only on mount.`
    )
  }, [config, onComplete])

  useDepsCompareLog('StableDepsRefactored', [config, onComplete], ['config', 'onComplete'])

  return (
    <section className="identity-demo-card identity-demo-card--correct">
      <header className="identity-demo-card__header">
        <h3>Refactored: stable dependencies</h3>
        <p>
          <code>config</code> = <code>useMemo(() =&gt; ({`{ theme: 'dark' }`}), [])</code>.{' '}
          <code>onComplete</code> = <code>useCallback(() =&gt; {}, [])</code>. Same reference every render → Object.is(prev, next) is true → effect does not re-run. Effect run count stays 1.
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
      <p className="identity-demo-card__hint">
        Each click → re-render → same config and onComplete references → effect does NOT re-run. Effect run count stays 1.
      </p>
    </section>
  )
}
