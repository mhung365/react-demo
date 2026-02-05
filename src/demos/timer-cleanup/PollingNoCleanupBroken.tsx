import { useState, useEffect } from 'react'
import { fetchPollResult } from './mockApi'
import { logIntervalStart, logIntervalTick } from './intervalLog'
import type { PollResult } from './types'
import './timer-cleanup-demo.css'

const POLL_MS = 2000

/**
 * BROKEN: setInterval with no cleanup + stale closure.
 *
 * 1. Missing cleanup: When component unmounts (e.g. switch to another demo tab) or when
 *    effect re-runs (deps change), we don't clear the interval. Interval keeps firing →
 *    setState on unmounted component (warning). When user comes back, we start another
 *    interval → intervals stack. Console: multiple "tick" logs per period (e.g. 2 ticks
 *    every 2s after remount).
 *
 * 2. Stale closure: The interval callback captures `refreshCount` from the closure when
 *    the effect ran. So inside the callback, `refreshCount` is always the initial value
 *    (e.g. 0). We use setRefreshCount(c => c + 1) for the update (correct), but if we
 *    read refreshCount for logging or logic, we see the stale value. Log shows
 *    "refreshCount from closure: 0" every tick.
 */
export function PollingNoCleanupBroken() {
  const [refreshCount, setRefreshCount] = useState(0)
  const [result, setResult] = useState<PollResult | null>(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (!enabled) return

    logIntervalStart('polling (no cleanup)')
    const id = setInterval(() => {
      // Stale: refreshCount here is the value from when the effect ran (e.g. 0).
      logIntervalTick('polling (no cleanup)', {
        refreshCountFromClosure: refreshCount,
        note: 'refreshCount is stale; we use setRefreshCount(c => c+1) for update',
      })
      fetchPollResult().then((data) => {
        setResult(data)
        setRefreshCount((c) => c + 1) // Functional update avoids stale state for the setter
      })
    }, POLL_MS)

    // BUG: No cleanup. On unmount or when enabled/deps change, interval keeps running.
    // When user switches tab and comes back, we get a second interval → stacking.
  }, [enabled]) // refreshCount intentionally omitted to show stale closure in the callback

  return (
    <section className="timer-section timer-section--broken">
      <h2>Broken: no cleanup + stale closure</h2>
      <p className="timer-section__hint">
        No <code>clearInterval</code> in cleanup. Switch to another demo tab and back: you get multiple intervals (see console: multiple ticks per 2s). Interval callback captures <code>refreshCount</code> from closure — log shows stale value. Unmount causes setState-after-unmount warning.
      </p>
      <div className="timer-section__controls">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Polling enabled
        </label>
      </div>
      {result && (
        <p className="timer-section__meta">
          Refreshes: {refreshCount} | Last: {result.timestamp.slice(11, 19)} — value {result.value}
        </p>
      )}
    </section>
  )
}
