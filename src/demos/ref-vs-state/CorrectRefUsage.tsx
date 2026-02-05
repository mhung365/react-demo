import { useState, useRef, useEffect } from 'react'
import { useRenderCount } from './useRenderCount'
import './ref-vs-state-demo.css'

/**
 * Correct use of useRef: store something that must persist across renders
 * but should NOT trigger a re-render when it changes.
 *
 * 1. Interval ID — we need to clear the interval in cleanup. Storing in state would
 *    cause re-renders when we set the ID; we don't need the ID in the UI. Ref is correct.
 * 2. Previous value — we want to show "previous count" for comparison. We could derive
 *    it in state, but storing in a ref and updating in effect is a valid pattern when
 *    "previous" is derived from "current" and we only need it for display in the next render.
 *    Here we use ref to hold the interval ID (canonical correct use).
 */
export function CorrectRefUsage() {
  const [seconds, setSeconds] = useState(0)
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const renderCount = useRenderCount('CorrectRefUsage')

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    console.log(`[ref correct] Stored interval ID in ref — will clear in cleanup. Ref mutation does not trigger re-render.`)

    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current)
        console.log(`[ref correct] Cleanup: cleared interval from ref.`)
      }
    }
  }, [])

  return (
    <section className="ref-demo-card ref-demo-card--correct">
      <header className="ref-demo-card__header">
        <h3>Correct: useRef for interval ID</h3>
        <p>
          We need the interval ID to clear it in <code>useEffect</code> cleanup. Storing it in state
          would cause an extra re-render when we set it, and we don&apos;t need the ID in the UI.
          Ref persists across renders and does not trigger re-render — correct.
        </p>
      </header>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Seconds (state — drives UI):</span>
        <strong className="ref-demo-card__value">{seconds}</strong>
      </div>
      <div className="ref-demo-card__row">
        <span className="ref-demo-card__label">Render #:</span>
        <strong className="ref-demo-card__value">{renderCount}</strong>
      </div>
      <p className="ref-demo-card__hint">
        Timer runs every second; state updates so UI updates. Interval ID lives in a ref so we can clear it — ref never drives UI.
      </p>
    </section>
  )
}
