import { useState, useRef } from 'react'
import { useSnapshotLog, useLatestRef } from './useSnapshotLog'
import './snapshot-demo.css'

const DELAY_MS = 1500

/**
 * BROKEN: "Increment in 1.5s" uses count from the render when the timeout was created.
 * Each render has a snapshot of state; the timeout callback closes over that snapshot.
 *
 * Try: click "Increment in 1.5s" 3 times quickly. You get 1, not 3.
 * Console shows: handler created in render #N with snapshot count = X;
 * when it runs, "current count" (from ref) may already be higher — value looks correct
 * in that render, but the reference (closure) is stale.
 */
export function CounterBroken() {
  const [count, setCount] = useState(0)
  const renderIdRef = useRef(0)
  renderIdRef.current += 1
  const renderId = renderIdRef.current
  const latestCountRef = useLatestRef(count)

  useSnapshotLog('CounterBroken', { count, renderId })

  const handleIncrementNow = () => {
    setCount(count + 1)
  }

  const handleIncrementDelayed = () => {
    const snapshotCount = count
    const snapshotRenderId = renderId
    console.log(
      `[broken] Created delayed handler in render #${snapshotRenderId} — snapshot count = ${snapshotCount}. ` +
        `When this timeout runs, it will still see count = ${snapshotCount} (closure).`
    )
    setTimeout(() => {
      const currentCount = latestCountRef.current
      const valueLooksCorrect = snapshotCount === currentCount
      console.log(
        `[broken] Timeout ran. Created in render #${snapshotRenderId}, snapshot count = ${snapshotCount}. ` +
          `Current count (ref) = ${currentCount}. ` +
          `Value from closure: ${snapshotCount} → setting to ${snapshotCount + 1}. ` +
          (valueLooksCorrect ? 'Value matched by luck.' : `STALE: we wanted ${currentCount + 1}, not ${snapshotCount + 1}.`)
      )
      setCount(snapshotCount + 1)
    }, DELAY_MS)
  }

  return (
    <section className="snapshot-counter snapshot-counter--broken">
      <header className="snapshot-counter__header">
        <h3>Broken: closure over snapshot</h3>
        <p>
          &quot;Increment in 1.5s&quot; uses <code>count</code> from the render when the button was clicked.
          That snapshot is fixed; the callback never sees later updates.
        </p>
      </header>
      <div className="snapshot-counter__display">
        <span className="snapshot-counter__label">Count:</span>
        <strong className="snapshot-counter__value">{count}</strong>
      </div>
      <div className="snapshot-counter__actions">
        <button type="button" onClick={handleIncrementNow}>
          Increment now
        </button>
        <button type="button" onClick={handleIncrementDelayed}>
          Increment in 1.5s
        </button>
      </div>
      <p className="snapshot-counter__hint">
        Click &quot;Increment in 1.5s&quot; three times quickly. You get 1, not 3. Check console for which render each value came from.
      </p>
    </section>
  )
}
