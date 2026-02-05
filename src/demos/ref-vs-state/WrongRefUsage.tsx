import { useRef } from 'react'
import { useRenderCount } from './useRenderCount'
import './ref-vs-state-demo.css'

/**
 * Bug: using useRef for data that should drive the UI.
 *
 * We store "count" in a ref and display ref.current in JSX. When the user clicks
 * "Increment", we only do ref.current += 1. No setState → no re-render → the UI
 * still shows the value from the previous render. The displayed count is wrong (stale).
 *
 * This is the classic misuse: "I'll use a ref to avoid re-renders." But the value
 * is part of the UI — the user expects to see it update. Ref does not trigger re-render,
 * so the UI does not update. Bug.
 */
export function WrongRefUsage() {
  const countRef = useRef(0)
  const renderCount = useRenderCount('WrongRefUsage')

  const handleIncrement = () => {
    countRef.current += 1
    console.log(
      `[ref BUG] Incremented ref to ${countRef.current} — but no re-render, so UI still shows old value. ` +
        `User expects to see ${countRef.current}.`
    )
  }

  return (
    <section className="ref-demo-card ref-demo-card--wrong">
      <header className="ref-demo-card__header">
        <h3>Bug: ref used for UI-driving data</h3>
        <p>
          Count is stored in a ref and displayed. Clicking &quot;Increment&quot; only mutates <code>ref.current</code>. No <code>setState</code> → no re-render → displayed count
          does not update. The value the user should see lives in a ref, so the UI is wrong.
        </p>
      </header>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Count (ref — should be state):</span>
        <strong className="ref-demo-card__value">{countRef.current}</strong>
      </div>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Render #:</span>
        <strong className="ref-demo-card__value">{renderCount}</strong>
      </div>
      <button type="button" onClick={handleIncrement}>
        Increment
      </button>
      <p className="ref-demo-card__hint ref-demo-card__hint--wrong">
        Click &quot;Increment&quot; — the number does not change. Ref mutation does not create a new render snapshot; the UI is stale. Use useState for data that must be shown to the user.
      </p>
    </section>
  )
}
