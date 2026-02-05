import { useState, useEffect } from 'react'
import { fetchAppConfig } from './mockApi'
import { useRenderLog } from './useRenderLog'
import type { AppConfig } from './types'
import './fetch-during-render-demo.css'

/**
 * CORRECT: Fetch in useEffect (after commit). Render is pure.
 *
 * - Render only reads state and returns JSX; no fetch, no setState from async in render.
 * - useEffect runs after React has committed the tree; starting fetch there is a side effect in the right place.
 * - Same (props, state) → same JSX; no side effects during render.
 *
 * Console: [render] #1, #2 (once when data arrives); no "fetch during render". Fetch runs in effect.
 */
export function FetchInEffectCorrect() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  useRenderLog('FetchInEffectCorrect', { hasData: !!config })

  useEffect(() => {
    let cancelled = false
    fetchAppConfig().then((data) => {
      if (!cancelled) setConfig(data)
    })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="fetch-during-render-section fetch-during-render-section--correct">
      <h2>Correct: fetch in useEffect</h2>
      <p className="fetch-during-render-section__hint">
        Render is pure: no fetch in the component body. Fetch runs in useEffect (after commit). Console: [render] #1, then [render] #2 when data arrives — no repeated fetches.
      </p>
      {config ? (
        <p><strong>Theme:</strong> {config.theme} — <strong>Version:</strong> {config.version}</p>
      ) : (
        <p>Loading…</p>
      )}
    </section>
  )
}
