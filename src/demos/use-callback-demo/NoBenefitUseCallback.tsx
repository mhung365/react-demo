import { useState, useCallback, useRef } from 'react'
import { useCallbackIdentityLog } from './useCallbackIdentityLog'
import './use-callback-demo.css'

/**
 * useCallback ADDS COMPLEXITY WITH NO BENEFIT: Callback passed to a NON-memoized child.
 *
 * We use useCallback for onClick, but the child (a plain div/button or a component that isn't memoized)
 * re-renders when the parent re-renders anyway. So the stable reference doesn't prevent any re-render.
 * useCallback adds: dependency array, mental overhead, risk of stale closure if deps wrong. Benefit: none.
 *
 * Removing useCallback: same behavior (child re-renders every time), simpler code.
 */
function PlainChild({ onClick, label }: { onClick: () => void; label: string }) {
  const renderCount = useRef(0)
  renderCount.current += 1
  console.log(`[PlainChild] render #${renderCount.current} — NOT memoized, so re-renders every time parent re-renders`)
  return (
    <div className="callback-demo-card__child">
      <span className="callback-demo-card__label">{label}</span>
      <button type="button" onClick={onClick}>Invoke</button>
    </div>
  )
}

export function NoBenefitUseCallback() {
  const [count, setCount] = useState(0)

  const onClick = useCallback(() => {
    console.log('clicked')
  }, [])

  useCallbackIdentityLog('NoBenefitUseCallback', onClick, 'onClick')

  return (
    <section className="callback-demo-card callback-demo-card--warning">
      <header className="callback-demo-card__header">
        <h3>useCallback with no benefit</h3>
        <p>
          We use useCallback for <code>onClick</code>, but the child is <strong>not memoized</strong>. The child re-renders when the parent re-renders regardless of callback identity. useCallback adds dependency array and complexity with <strong>no perf benefit</strong>. Removing useCallback: simpler code, same behavior.
        </p>
      </header>
      <div className="callback-demo-card__row">
        <span className="callback-demo-card__label">Count:</span>
        <strong>{count}</strong>
      </div>
      <PlainChild onClick={onClick} label="PlainChild (not memo):" />
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
      <p className="callback-demo-card__hint">
        Child re-renders every time (not memoized). useCallback doesn&apos;t change that. Remove useCallback → simpler, same perf.
      </p>
    </section>
  )
}
