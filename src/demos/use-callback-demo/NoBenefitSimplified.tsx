import { useState, useRef } from 'react'
import './use-callback-demo.css'

/**
 * SIMPLIFIED: Same as NoBenefitUseCallback but WITHOUT useCallback.
 *
 * Child is not memoized, so it re-renders when parent re-renders regardless of callback identity.
 * We pass inline onClick. Simpler code (no dependency array, no useCallback). Same behavior, no perf loss.
 * Removing useCallback improves readability with no perf loss when the child doesn't need a stable ref.
 */
function PlainChild({ onClick, label }: { onClick: () => void; label: string }) {
  const renderCount = useRef(0)
  renderCount.current += 1
  console.log(`[PlainChild] render #${renderCount.current} — NOT memoized`)
  return (
    <div className="callback-demo-card__child">
      <span className="callback-demo-card__label">{label}</span>
      <button type="button" onClick={onClick}>Invoke</button>
    </div>
  )
}

export function NoBenefitSimplified() {
  const [count, setCount] = useState(0)

  const onClick = () => {
    console.log('clicked')
  }

  return (
    <section className="callback-demo-card callback-demo-card--correct">
      <header className="callback-demo-card__header">
        <h3>Simplified: no useCallback</h3>
        <p>
          Same scenario (child not memoized) but we pass <code>onClick = () =&gt; {`{ ... }`}</code> (inline). No useCallback — simpler code, no dependency array. Child re-renders every time anyway (not memoized). <strong>Readability improved, no perf loss.</strong>
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
        Same behavior as &quot;No benefit useCallback&quot; — child re-renders every time. Simpler code without useCallback.
      </p>
    </section>
  )
}
