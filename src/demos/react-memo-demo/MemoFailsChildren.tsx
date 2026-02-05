import { useState, useCallback } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { ExpensiveChild } from './ExpensiveChild'
import type { ChildConfig } from './types'

const stableConfig: ChildConfig = { theme: 'dark', pageSize: 10 }

/**
 * Scenario: React.memo FAILS — children prop changes every render.
 * Parent passes <ExpensiveChild>...{tick}...</ExpensiveChild> → children is a React element (object).
 * Each render creates a NEW element (new reference) → shallow compare: prevProps.children !== nextProps.children →
 * child re-renders. Memo compares ALL props including children; inline JSX creates new element every time.
 */
export function MemoFailsChildren() {
  const [tick, setTick] = useState(0)
  useRenderLog('Parent (MemoFailsChildren)')

  const onSubmit = useCallback((value: string) => console.log('Submitted:', value), [])

  return (
    <div className="memo-scenario memo-scenario--fails">
      <header className="memo-scenario__header">
        <h3>Memo fails: children prop changes (inline JSX)</h3>
        <p>
          Parent passes stable config/onSubmit but <code>children={'{tick}'}</code>. The <code>children</code> prop
          is the result of JSX — a new React element object every render. React.memo shallow-compares all props;
          prevProps.children !== nextProps.children → child re-renders every time.
        </p>
      </header>
      <div className="memo-scenario__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment (tick: {tick})
        </button>
      </div>
      <ExpensiveChild config={stableConfig} onSubmit={onSubmit}>
        <span>Tick: {tick}</span>
      </ExpensiveChild>
      <p className="memo-hint">
        <strong>Console:</strong> Even with stable config/onSubmit, ExpensiveChild re-renders because the{' '}
        <code>children</code> prop is a new element each time. Memo does NOT prevent re-render when any prop (including
        children) has a new reference.
      </p>
    </div>
  )
}
