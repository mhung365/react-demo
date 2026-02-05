import { useState, useEffect, useRef } from 'react'
import { fetchPollResult } from './mockApi'
import { logIntervalTick } from './intervalLog'
import type { PollResult } from './types'
import './timer-cleanup-demo.css'

const POLL_MS = 2000

/**
 * ALTERNATIVE: No setInterval. Use recursive setTimeout so only one timer is ever pending.
 *
 * - After each fetch, we schedule the next poll with setTimeout. When the effect cleanup
 *   runs, we set a "cancelled" flag so the pending timeout's callback won't schedule
 *   another one. We don't need to clear a timer by id if we only ever have one pending
 *   timeout and we guard with cancelled.
 *
 * - Alternatively: use React Query's refetchInterval so the library owns the timer. Here we
 *   show "recursive setTimeout" as a manual alternative that avoids setInterval stacking
 *   (there's only one timeout at a time).
 */
export function AlternativeNoInterval() {
  const [refreshCount, setRefreshCount] = useState(0)
  const [result, setResult] = useState<PollResult | null>(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    function scheduleNext(): void {
      if (cancelled) return
      timeoutId = setTimeout(() => {
        if (cancelled) return
        logIntervalTick('polling (recursive setTimeout)', { note: 'only one timer at a time' })
        fetchPollResult().then((data) => {
          if (cancelled) return
          setResult(data)
          setRefreshCount((c) => c + 1)
          scheduleNext()
        })
      }, POLL_MS)
    }

    scheduleNext()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [enabled])

  return (
    <section className="timer-section timer-section--alternative">
      <h2>Alternative: recursive setTimeout (no setInterval)</h2>
      <p className="timer-section__hint">
        After each fetch, schedule the next with <code>setTimeout</code>. Only one timer is pending at a time. Cleanup sets <code>cancelled</code> so the callback won&apos;t schedule again. Or use React Query&apos;s <code>refetchInterval</code> and avoid manual timers.
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
