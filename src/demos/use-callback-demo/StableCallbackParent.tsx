import { useState, useCallback } from 'react'
import { useCallbackIdentityLog } from './useCallbackIdentityLog'
import { MemoizedChild } from './MemoizedChild'
import './use-callback-demo.css'

/**
 * useCallback FIXES A REAL ISSUE: Same parent + memoized child, but callback is stable.
 *
 * onAction = useCallback((value) => { ... }, []). Same reference across renders (deps unchanged).
 * MemoizedChild shallow-compares: prevProps.onAction === nextProps.onAction → child SKIPS re-render.
 *
 * useCallback here "treats the symptom" (unstable reference) so that memo can do its job. The "root cause"
 * (parent re-renders when count changes) is unchanged — we didn't stop the parent from re-rendering. We fixed
 * reference instability so the child doesn't re-render unnecessarily. When you have a memoized child that
 * receives a callback, useCallback is necessary to get the benefit of memo.
 */
export function StableCallbackParent() {
  const [count, setCount] = useState(0)

  const onAction = useCallback((value: string) => {
    console.log('onAction:', value)
  }, [])

  useCallbackIdentityLog('StableCallbackParent', onAction, 'onAction')

  return (
    <section className="callback-demo-card callback-demo-card--correct">
      <header className="callback-demo-card__header">
        <h3>useCallback necessary: stable reference → child skips</h3>
        <p>
          <code>onAction</code> = useCallback((value) =&gt; {`{ ... }`}, []). Same reference every render. MemoizedChild shallow-compares: prevProps.onAction === nextProps.onAction → child <strong>skips</strong> re-render. Check console: callback identity <strong>SAME</strong>; child render count stays 1 when only count changes.
        </p>
      </header>
      <div className="callback-demo-card__row">
        <span className="callback-demo-card__label">Count (parent state):</span>
        <strong>{count}</strong>
      </div>
      <MemoizedChild onAction={onAction} label="MemoizedChild:" />
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment (re-render parent)
      </button>
      <p className="callback-demo-card__hint">
        Each click → parent re-renders → same onAction reference (useCallback) → child does NOT re-render. Callback identity: SAME.
      </p>
    </section>
  )
}
