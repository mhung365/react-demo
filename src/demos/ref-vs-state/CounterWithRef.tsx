import { useRef, useState } from 'react'
import { useRenderCount } from './useRenderCount'
import './ref-vs-state-demo.css'

/**
 * useRef persists a value across renders but does NOT schedule a re-render when mutated.
 * - ref.current = x does not trigger a re-render.
 * - The component function does not run again; the UI shows whatever was rendered last time.
 *
 * Click "Increment (ref)" → ref.current++ → no re-render → displayed value does not change.
 * Click "Force re-render" → setState → re-render → we read ref.current again and display updates.
 */
export function CounterWithRef() {
  const countRef = useRef(0)
  const [, forceUpdate] = useState(0)
  const renderCount = useRenderCount('CounterWithRef')

  const handleIncrementRef = () => {
    countRef.current += 1
    console.log(
      `[ref] countRef.current = ${countRef.current} — no setState, so no re-render. ` +
        `UI still shows ${countRef.current - 1} until something else causes a re-render.`
    )
  }

  const handleForceReRender = () => {
    console.log(`[ref] Force re-render (setState) — component will run again; JSX will read ref.current = ${countRef.current}.`)
    forceUpdate((n) => n + 1)
  }

  return (
    <section className="ref-demo-card ref-demo-card--ref">
      <header className="ref-demo-card__header">
        <h3>useRef: no re-render on mutation</h3>
        <p>
          <code>ref.current = x</code> does not tell React to re-render. The value persists,
          but the component function does not run again — so the UI does not update until
          another reason causes a re-render (e.g. parent, or local setState elsewhere).
        </p>
      </header>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Ref value (from last render):</span>
        <strong className="ref-demo-card__value">{countRef.current}</strong>
      </div>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Render #:</span>
        <strong className="ref-demo-card__value">{renderCount}</strong>
      </div>
      <div className="ref-demo-card__actions">
        <button type="button" onClick={handleIncrementRef}>
          Increment (ref)
        </button>
        <button type="button" onClick={handleForceReRender}>
          Force re-render
        </button>
      </div>
      <p className="ref-demo-card__hint">
        Click &quot;Increment (ref)&quot; several times — number does not change. Then &quot;Force re-render&quot; — it jumps to the ref value. Ref mutation did not create a new render snapshot.
      </p>
    </section>
  )
}
