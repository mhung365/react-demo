import { useState, useEffect } from 'react'
import { useIdentityLog } from './useIdentityLog'
import type { FilterConfig } from './types'

/**
 * Component passes inline config to useEffect dependency array.
 * Every render creates a new config object → effect runs every time (unnecessary re-fetch/side-effect).
 */
export function InlineBreaksEffect() {
  const [count, setCount] = useState(0)
  const config: FilterConfig = { theme: 'dark', pageSize: 10, sortBy: 'name' }

  useIdentityLog('effect config', config)

  useEffect(() => {
    console.log('[effect] InlineBreaksEffect — effect ran (e.g. would re-fetch with config)')
    // Simulate: fetchWithConfig(config)
  }, [config])

  return (
    <div className="identity-scenario identity-scenario--problem">
      <div className="identity-scenario__header">
        <h3>2. Inline objects trigger unnecessary useEffect re-runs</h3>
        <p>
          <code>useEffect(..., [config])</code> with <code>config</code> created inline. React
          compares deps by reference; new object every render → effect runs every time.
        </p>
      </div>
      <div className="identity-scenario__measure">
        Click “Increment”. Console: [identity] config = NEW reference; [effect] runs on every
        click even though config content did not change.
      </div>
      <button type="button" className="identity-btn" onClick={() => setCount((c) => c + 1)}>
        Increment ({count})
      </button>
      <div className="identity-hint identity-hint--bad">
        <strong>Why:</strong> useEffect compares dependency array with Object.is (reference
        equality). Inline <code>{`{ theme: 'dark', ... }`}</code> is a new reference every render, so
        React thinks the dependency changed and re-runs the effect. Fix: useMemo(config) or
        depend on primitives (theme, pageSize, sortBy).
      </div>
    </div>
  )
}
