import { useState, useEffect, useRef } from 'react'
import { fetchPollResult } from './mockApi'
import { logIntervalStart, logIntervalTick, logIntervalCleanup } from './intervalLog'
import type { PollResult } from './types'
import './timer-cleanup-demo.css'

const POLL_MS = 2000

/**
 * CORRECT: setInterval with cleanup + ref for current value in callback.
 *
 * - Cleanup: return () => clearInterval(id). When component unmounts or when enabled
 *   changes, we clear the interval. No stacking; no setState after unmount.
 *
 * - Stale closure avoided: If we need the latest refreshCount inside the interval
 *   callback (e.g. for logging or conditional logic), we read from a ref that we
 *   update every render: refreshCountRef.current = refreshCount. The callback
 *   reads refreshCountRef.current so it always sees the latest value.
 */
export function PollingWithCleanupCorrect() {
  const [refreshCount, setRefreshCount] = useState(0)
  const [result, setResult] = useState<PollResult | null>(null)
  const [enabled, setEnabled] = useState(true)
  const refreshCountRef = useRef(refreshCount)
  refreshCountRef.current = refreshCount

  useEffect(() => {
    if (!enabled) return

    logIntervalStart('polling (with cleanup)')
    const id = setInterval(() => {
      logIntervalTick('polling (with cleanup)', {
        refreshCountFromRef: refreshCountRef.current,
        note: 'ref always has latest value',
      })
      fetchPollResult().then((data) => {
        setResult(data)
        setRefreshCount((c) => c + 1)
      })
    }, POLL_MS)

    return () => {
      logIntervalCleanup('polling (with cleanup)')
      clearInterval(id)
    }
  }, [enabled])

  return (
    <section className="timer-section timer-section--correct">
      <h2>Correct: cleanup + ref for latest value</h2>
      <p className="timer-section__hint">
        Cleanup calls <code>clearInterval(id)</code>. Switch tabs and back: only one interval. Use a ref (<code>refreshCountRef.current</code>) in the callback to read the latest value; no stale closure.
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
