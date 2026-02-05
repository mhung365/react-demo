import { useState, useCallback, createContext, useContext, useRef, memo } from 'react'
import { useCallbackIdentityLog } from './useCallbackIdentityLog'
import './use-callback-demo.css'

/**
 * REFACTOR: Remove the need for useCallback in the parent entirely by changing architecture.
 *
 * Instead of Parent passing a callback to MemoizedChild (and needing useCallback to stabilize it),
 * we provide the callback via CONTEXT. The context value is stable (useCallback in the provider).
 * MemoizedChild gets onAction from useContext — same reference every time (from context).
 * Parent re-renders don't change the context value, so child doesn't re-render.
 *
 * No useCallback in the parent that renders the child — we removed the need by fixing architecture.
 */
type ActionContextValue = { onAction: (value: string) => void }
const ActionContext = createContext<ActionContextValue | null>(null)

function useAction() {
  const ctx = useContext(ActionContext)
  if (!ctx) throw new Error('useAction must be used inside ActionProvider')
  return ctx
}

const ActionProvider = memo(function ActionProvider({ children }: { children: React.ReactNode }) {
  const onAction = useCallback((value: string) => {
    console.log('onAction (from context):', value)
  }, [])

  const value: ActionContextValue = { onAction }
  return <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
})

const ChildWithContext = memo(function ChildWithContext() {
  const { onAction } = useAction()
  const renderCount = useRef(0)
  renderCount.current += 1
  console.log(`[ChildWithContext] render #${renderCount.current} — gets onAction from context (stable)`)

  return (
    <div className="callback-demo-card__child">
      <span className="callback-demo-card__label">ChildWithContext (memo):</span>
      <span className="callback-demo-card__value">Render count: {renderCount.current}</span>
      <button type="button" onClick={() => onAction('clicked')}>
        Invoke (from context)
      </button>
    </div>
  )
})

/**
 * This component is INSIDE ActionProvider. It has count state and re-renders when count changes.
 * It does NOT pass a callback to the child — child gets onAction from context.
 * No useCallback in this parent — we removed the need entirely.
 */
function RefactorNoCallbackInner() {
  const [count, setCount] = useState(0)
  const { onAction } = useAction()
  useCallbackIdentityLog('RefactorNoCallbackInner', onAction, 'onAction (from context)')

  return (
    <section className="callback-demo-card callback-demo-card--correct">
      <header className="callback-demo-card__header">
        <h3>Refactor: no useCallback in parent</h3>
        <p>
          Child gets <code>onAction</code> from <strong>context</strong>, not from parent. Context value is stable (useCallback in provider). Parent doesn&apos;t pass a callback — no useCallback in parent. Parent re-renders don&apos;t change context → child skips re-render. Architecture change removes the need for useCallback in the parent.
        </p>
      </header>
      <div className="callback-demo-card__row">
        <span className="callback-demo-card__label">Count (parent state):</span>
        <strong>{count}</strong>
      </div>
      <ChildWithContext />
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment (re-render parent)
      </button>
      <p className="callback-demo-card__hint">
        Click Increment: parent re-renders but child gets callback from context (stable). Child does NOT re-render. No useCallback in parent.
      </p>
    </section>
  )
}

export function RefactorNoCallback() {
  return (
    <ActionProvider>
      <RefactorNoCallbackInner />
    </ActionProvider>
  )
}
