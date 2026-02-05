import { useState } from 'react'
import { useCallbackIdentityLog } from './useCallbackIdentityLog'
import { MemoizedChild } from './MemoizedChild'
import './use-callback-demo.css'

/**
 * RE-RENDER CAUSED BY UNSTABLE CALLBACK: Parent passes inline callback to memoized child.
 *
 * Every render: onClick = () => { ... } creates a NEW function → new reference.
 * MemoizedChild does shallow compare: prevProps.onAction !== nextProps.onAction → child re-renders every time.
 *
 * useCallback does NOT fix the "root cause" (parent re-renders when count changes). It fixes the SYMPTOM:
 * the callback reference was unstable, so the child re-rendered even when the callback "behavior" didn't change.
 * useCallback stabilizes the reference so memo can skip the child when only parent state (e.g. count) changed.
 */
export function UnstableCallbackParent() {
  const [count, setCount] = useState(0)

  const onAction = (value: string) => {
    console.log('onAction:', value)
  }

  useCallbackIdentityLog('UnstableCallbackParent', onAction, 'onAction')

  return (
    <section className="callback-demo-card callback-demo-card--wrong">
      <header className="callback-demo-card__header">
        <h3>Unstable callback → child re-renders every time</h3>
        <p>
          Parent passes <code>onAction = (value) =&gt; {`{ ... }`}</code> (inline). Every render creates a <strong>new function</strong> → new reference. MemoizedChild shallow-compares: prevProps.onAction !== nextProps.onAction → child re-renders. Check console: callback identity <strong>NEW</strong> every render.
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
      <p className="callback-demo-card__hint callback-demo-card__hint--wrong">
        Each click → parent re-renders → new onAction reference → child re-renders. Callback identity: NEW every time.
      </p>
    </section>
  )
}
