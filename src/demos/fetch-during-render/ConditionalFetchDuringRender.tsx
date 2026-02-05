import { useState } from 'react'
import { fetchAppConfig } from './mockApi'
import { useRenderLog } from './useRenderLog'
import type { AppConfig } from './types'
import './fetch-during-render-demo.css'

/**
 * STILL WRONG: Fetch only when !config (conditional), but the fetch is still during render.
 *
 * - Does not infinite loop (we only fetch when config is null; after setState we have config).
 * - But render is IMPURE: we're starting a side effect (network request) inside the component body.
 * - In React 18 Strict Mode, React may render twice in dev → we can fire TWO fetches.
 * - Any other re-render (parent, context) before first fetch resolves could also trigger duplicate fetch.
 *
 * Console: [render] #1, #2 (Strict Mode double render?), "fetch during render" when !config.
 */
export function ConditionalFetchDuringRender() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  useRenderLog('ConditionalFetchDuringRender', { hasData: !!config })

  // BAD: Side effect during render, even if "guarded". Render must not start fetches.
  if (!config) {
    console.warn('[fetch during render] Conditional fetch — still a side effect in render!')
    fetchAppConfig().then((data) => {
      setConfig(data)
    })
  }

  return (
    <section className="fetch-during-render-section fetch-during-render-section--broken">
      <h2>Still wrong: conditional fetch during render</h2>
      <p className="fetch-during-render-section__hint">
        No infinite loop (we only fetch when <code>!config</code>), but render is impure. In Strict Mode you may see two [render] logs and two fetches. Render must be pure — no side effects.
      </p>
      {config ? (
        <p><strong>Theme:</strong> {config.theme} — <strong>Version:</strong> {config.version}</p>
      ) : (
        <p>Loading…</p>
      )}
    </section>
  )
}
