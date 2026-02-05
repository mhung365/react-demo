import { useState, useLayoutEffect } from 'react'
import './layout-effect-demo.css'

/**
 * BAD: useLayoutEffect for something that doesn't need to block paint.
 *
 * We simulate a "heavy" or async operation (e.g. fetch, subscribe, log) inside useLayoutEffect.
 * useLayoutEffect runs synchronously and BLOCKS the browser from painting. So:
 * - If we do something slow here, the user sees a delayed first paint (jank).
 * - For fetch/subscribe/log, useEffect is correct — run after paint so we don't block.
 *
 * Rule: use useLayoutEffect only when you need to read layout (getBoundingClientRect, scroll)
 * or mutate DOM and need the change to be visible in the same paint. For everything else, useEffect.
 */
export function BadUseLayoutEffect() {
  const [data, setData] = useState<string | null>(null)
  const [paintBlockedMs, setPaintBlockedMs] = useState<number | null>(null)

  // BAD: "Fetch" (simulated with setTimeout) in useLayoutEffect. This blocks painting until the "request" completes.
  useLayoutEffect(() => {
    const start = performance.now()
    console.log(
      `[BadUseLayoutEffect] useLayoutEffect started — browser CANNOT paint until this completes. ` +
        `We're doing a simulated "fetch" (setTimeout). This blocks paint.`
    )
    const id = setTimeout(() => {
      setData('Loaded')
      const elapsed = performance.now() - start
      setPaintBlockedMs(Math.round(elapsed))
      console.log(
        `[BadUseLayoutEffect] "Fetch" done after ${elapsed}ms. Paint was blocked for this time. Use useEffect for fetch.`
      )
    }, 300)
    return () => clearTimeout(id)
  }, [])

  return (
    <section className="layout-demo-card layout-demo-card--warning">
      <header className="layout-demo-card__header">
        <h3>Bad: useLayoutEffect for non-layout work</h3>
        <p>
          We simulated a &quot;fetch&quot; (setTimeout 300ms) inside <strong>useLayoutEffect</strong>. useLayoutEffect runs synchronously and <strong>blocks painting</strong>. The browser could not paint until the timeout fired — janky. For fetch, subscribe, or logging, use <strong>useEffect</strong> so you don&apos;t block paint.
        </p>
      </header>
      <div className="layout-demo-card__row">
        <span className="layout-demo-card__label">Data:</span>
        <strong>{data ?? 'Loading…'}</strong>
      </div>
      {paintBlockedMs !== null && (
        <div className="layout-demo-card__row">
          <span className="layout-demo-card__label">Paint was blocked for:</span>
          <strong className="layout-demo-card__value">{paintBlockedMs}ms</strong>
        </div>
      )}
      <p className="layout-demo-card__hint layout-demo-card__hint--wrong">
        Opening this tab, the first paint was delayed until the 300ms timeout completed. Use useEffect for async/non-layout work.
      </p>
    </section>
  )
}
