import { useState, useMemo, useCallback } from 'react'
import { useRenderLog } from './useRenderLog'
import type { DashboardConfig } from './types'
import { ChildPrimitive } from './ChildPrimitive'
import { ChildInlineObject } from './ChildInlineObject'
import { ChildStableProps } from './ChildStableProps'
import { ChildUnstableProps } from './ChildUnstableProps'
import { ChildWithCallback } from './ChildWithCallback'
import { StaticChild } from './StaticChild'

/**
 * Parent: owns state. When setState runs, Dashboard re-renders,
 * then every child is re-rendered by default (unless memoized and props referentially equal).
 */
export function Dashboard() {
  useRenderLog('Dashboard', { note: 'Parent — owns state' })

  const [count, setCount] = useState(0)
  const [label, setLabel] = useState('')

  // Stable reference: same object every render (same ref)
  const stableConfig = useMemo<DashboardConfig>(
    () => ({ theme: 'dark', locale: 'en' }),
    []
  )

  // Unstable: new function every render unless we use useCallback
  const stableOnAction = useCallback(() => {
    console.log('Stable callback invoked')
  }, [])

  return (
    <section className="dashboard" data-testid="dashboard">
      <header>
        <h1>Re-render vs DOM update</h1>
        <p>
          Parent state: <strong>{count}</strong>. Open console to see [render] / [commit] order.
        </p>
      </header>

      <div className="actions">
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Increment (parent setState)
        </button>
        <button type="button" onClick={() => setLabel((l) => (l ? '' : 'toggled'))}>
          Toggle label (parent setState)
        </button>
      </div>

      <div className="children">
        {/* Static content. Re-renders when parent re-renders but output is identical → no DOM update. */}
        <StaticChild />

        {/* No memo. Re-renders every time parent re-renders. */}
        <ChildPrimitive count={count} />

        {/* Inline object: new reference every render → always re-renders. */}
        <ChildInlineObject config={{ theme: 'dark', locale: 'en' }} />

        {/* Memo + stable config (useMemo): same ref → skips re-render when parent re-renders. */}
        <ChildStableProps config={stableConfig} />

        {/* Memo but inline object: new ref every time → memo doesn't help. */}
        <ChildUnstableProps config={{ theme: 'dark', locale: 'en' }} />

        {/* Memo + stable callback. If we passed inline () => {} here, new ref every render. */}
        <ChildWithCallback onAction={stableOnAction} />
      </div>
    </section>
  )
}
