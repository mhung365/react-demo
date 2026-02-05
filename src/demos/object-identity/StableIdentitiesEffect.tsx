import { useState, useMemo, useEffect } from 'react'
import { useIdentityLog } from './useIdentityLog'
import type { FilterConfig } from './types'

/**
 * Same as InlineBreaksEffect but with useMemo(config). Effect runs only when
 * config content actually changes (here never, since deps []).
 */
export function StableIdentitiesEffect() {
  const [count, setCount] = useState(0)
  const config = useMemo<FilterConfig>(
    () => ({ theme: 'dark', pageSize: 10, sortBy: 'name' }),
    []
  )

  useIdentityLog('effect config', config)

  useEffect(() => {
    console.log('[effect] StableIdentitiesEffect — effect ran (only when config reference changes)')
  }, [config])

  return (
    <div className="identity-scenario identity-scenario--correct">
      <div className="identity-scenario__header">
        <h3>4b. Stable config → effect runs only when deps change</h3>
        <p>
          <code>{'config = useMemo(() => ({ ... }), [])'}</code>. Same reference every
          render → effect runs once (mount). Click “Increment” → no [effect] log.
        </p>
      </div>
      <div className="identity-scenario__measure">
        Click “Increment”. Console: [identity] config = same reference; [effect] does not run
        again.
      </div>
      <button type="button" className="identity-btn" onClick={() => setCount((c) => c + 1)}>
        Increment ({count})
      </button>
      <div className="identity-hint identity-hint--good">
        <strong>Fix:</strong> useMemo(config) with correct deps, or depend on primitives
        (theme, pageSize, sortBy) instead of the object.
      </div>
    </div>
  )
}
