import { useState } from 'react'
import { fetchAppConfig } from './mockApi'
import { useRenderLog } from './useRenderLog'
import type { AppConfig } from './types'
import './fetch-during-render-demo.css'

/**
 * BROKEN: Fetch is triggered during render (component body).
 *
 * - Every time the component function runs, we call fetchAppConfig().
 * - When the promise resolves, we setState(config) → React schedules a re-render.
 * - Re-render runs the component again → we call fetchAppConfig() again → infinite loop.
 *
 * Console: [render] #1, #2, #3, ... and "fetch started during render" on every render.
 * Render is IMPURE: it has a side effect (starting a network request) and triggers state updates.
 */
export function FetchDuringRenderBroken() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  useRenderLog('FetchDuringRenderBroken', { hasData: !!config })

  // BAD: Side effect during render. This runs on EVERY render (including re-renders caused by setState below).
  console.warn('[fetch during render] Fetch started from component body — this is a side effect!')
  fetchAppConfig().then((data) => {
    setConfig(data) // Causes re-render → component runs again → fetch again → …
  })

  return (
    <section className="fetch-during-render-section fetch-during-render-section--broken">
      <h2>Broken: fetch during render</h2>
      <p className="fetch-during-render-section__hint">
        Open console. You’ll see <code>[render]</code> #1, #2, #3, … and &quot;fetch started during render&quot; every time.
        Each render starts a new fetch; when it resolves, setState causes another render → infinite loop.
      </p>
      {config ? (
        <p><strong>Theme:</strong> {config.theme} — <strong>Version:</strong> {config.version}</p>
      ) : (
        <p>Loading… (but new fetches keep firing every render)</p>
      )}
    </section>
  )
}
