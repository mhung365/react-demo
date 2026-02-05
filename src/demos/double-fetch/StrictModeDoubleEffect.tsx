import { useState, useEffect } from 'react'
import { fetchConfig } from './mockApi'
import { logFetchStart, logFetchEnd, logEffectRun } from './useFetchLog'
import type { AppConfig } from './types'
import './double-fetch-demo.css'

/**
 * STRICT MODE DOUBLE EFFECT (dev-only).
 *
 * In React 18 Strict Mode (dev), React intentionally runs effects twice on mount:
 * mount → run effect → cleanup → run effect again. So we see two [effect] mount logs
 * and two [fetch] start logs. This is EXPECTED in development.
 *
 * Why: To surface bugs that assume "effect runs once" and to ensure cleanup is correct.
 * Fix: Use a cancelled flag in cleanup so in-flight requests are ignored when the
 * effect is "replaced" by the second run. Then only the last run's result is used.
 * Disabling StrictMode is the WRONG solution — it hides real bugs.
 */
export function StrictModeDoubleEffect() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    logEffectRun('StrictModeDoubleEffect', 'mount')
    const params = { source: 'mount-only' }
    logFetchStart('config (StrictMode)', params)

    let cancelled = false
    setLoading(true)

    fetchConfig()
      .then((data) => {
        if (!cancelled) {
          setConfig(data)
          logFetchEnd('config (StrictMode)', params, true, `theme=${data.theme}`)
        } else {
          logFetchEnd('config (StrictMode)', params, true, '(ignored: cleanup ran)')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setConfig(null)
          logFetchEnd('config (StrictMode)', params, false, (e as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      logEffectRun('StrictModeDoubleEffect', 'cleanup')
      cancelled = true
    }
  }, [])

  return (
    <section className="double-fetch-section double-fetch-section--strict">
      <h2>StrictMode: double effect (dev-only)</h2>
      <p className="double-fetch-section__hint">
        With <code>StrictMode</code> (see main.tsx), React runs effect → cleanup → effect again on mount.
        Console: two <code>[effect] mount</code> and two <code>[fetch] start</code>. One response is ignored (cleanup).
        This does <strong>not</strong> happen in production build.
      </p>
      {loading && !config && <p>Loading config…</p>}
      {config && <p><strong>{config.theme}</strong> — v{config.version}</p>}
    </section>
  )
}
