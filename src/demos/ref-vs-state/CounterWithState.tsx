import { useState } from 'react'
import { useRenderCount } from './useRenderCount'
import './ref-vs-state-demo.css'

/**
 * useState participates in the render cycle:
 * - setState() schedules a re-render.
 * - React runs the component function again with the new state.
 * - Each update creates a new render snapshot; the UI reflects the latest state.
 *
 * Click "Increment" → setState → re-render → render count goes up, display updates.
 */
export function CounterWithState() {
  const [count, setCount] = useState(0)
  const renderCount = useRenderCount('CounterWithState')

  const handleIncrement = () => {
    console.log(`[state] setState(${count + 1}) called — React will schedule a re-render.`)
    setCount(count + 1)
  }

  return (
    <section className="ref-demo-card ref-demo-card--state">
      <header className="ref-demo-card__header">
        <h3>useState: triggers re-render</h3>
        <p>
          <code>setState</code> tells React state changed. React schedules a re-render;
          the component function runs again with the new state. UI and render count both update.
        </p>
      </header>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Count (state):</span>
        <strong className="ref-demo-card__value">{count}</strong>
      </div>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Render #:</span>
        <strong className="ref-demo-card__value">{renderCount}</strong>
      </div>
      <button type="button" onClick={handleIncrement}>
        Increment
      </button>
      <p className="ref-demo-card__hint">
        Each click → setState → re-render → render # and count both increase. Check console for [render] logs.
      </p>
    </section>
  )
}
