import { useState, useRef } from 'react'
import { useSnapshotLog } from './useSnapshotLog'
import './snapshot-demo.css'

const DELAY_MS = 1500

/**
 * FIXED: "Increment in 1.5s" uses a functional update setCount(c => c + 1).
 * We do not close over count; React passes the latest state when the updater runs.
 *
 * Try: click "Increment in 1.5s" 3 times quickly. You get 3.
 * Console shows: handler created in render #N (no snapshot count); when it runs,
 * we use the updater — no stale closure.
 */
export function CounterFixed() {
  const [count, setCount] = useState(0)
  const renderIdRef = useRef(0)
  renderIdRef.current += 1
  const renderId = renderIdRef.current

  useSnapshotLog('CounterFixed', { count, renderId })

  const handleIncrementNow = () => {
    setCount((c) => c + 1)
  }

  const handleIncrementDelayed = () => {
    const snapshotRenderId = renderId
    console.log(
      `[fixed] Created delayed handler in render #${snapshotRenderId}. ` +
        `We do NOT close over count — we will use setCount(c => c + 1) when the timeout runs.`
    )
    setTimeout(() => {
      console.log(
        `[fixed] Timeout ran (was created in render #${snapshotRenderId}). ` +
          `Calling setCount(c => c + 1) — React passes current state to updater; no stale closure.`
      )
      setCount((c) => c + 1)
    }, DELAY_MS)
  }

  return (
    <section className="snapshot-counter snapshot-counter--fixed">
      <header className="snapshot-counter__header">
        <h3>Fixed: functional update</h3>
        <p>
          &quot;Increment in 1.5s&quot; calls <code>{`setCount(c => c + 1)`}</code>. The updater receives
          the latest state when it runs, so no closure over <code>count</code>.
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
        Click &quot;Increment in 1.5s&quot; three times quickly. Count goes 0 → 1 → 2 → 3. No stale closure.
      </p>
    </section>
  )
}
