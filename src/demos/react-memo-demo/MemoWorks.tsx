import { useState, useMemo, useCallback } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { ExpensiveChild } from './ExpensiveChild'
import type { ChildConfig } from './types'

/**
 * Scenario: React.memo SUCCESS — stable prop references.
 * Parent passes config (useMemo) and onSubmit (useCallback) with empty deps →
 * same object/function reference every time parent re-renders.
 * React.memo(ExpensiveChild) does shallow compare: prevProps.config === nextProps.config,
 * prevProps.onSubmit === nextProps.onSubmit → true → SKIP re-render.
 * Console: click Increment → only [render] Parent; NO [render] ExpensiveChild.
 */
export function MemoWorks() {
  const [tick, setTick] = useState(0)
  useRenderLog('Parent (MemoWorks)')

  const config = useMemo<ChildConfig>(() => ({ theme: 'dark', pageSize: 10 }), [])
  const onSubmit = useCallback((value: string) => {
    console.log('Submitted:', value)
  }, [])

  return (
    <div className="memo-scenario memo-scenario--works">
      <header className="memo-scenario__header">
        <h3>Memo works: stable prop references</h3>
        <p>
          Parent state (tick): {tick}. Config and onSubmit are useMemo/useCallback with [] → same refs every render.
          React.memo shallow-compares props; refs are equal → child does NOT re-render. Click Increment: only Parent
          logs in console; ExpensiveChild does not.
        </p>
      </header>
      <div className="memo-scenario__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment parent state (tick: {tick})
        </button>
      </div>
      <ExpensiveChild config={config} onSubmit={onSubmit} />
      <p className="memo-hint">
        <strong>Console:</strong> After first load, click Increment. You should see <code>[render] Parent (MemoWorks)</code> only —
        no <code>[render] ExpensiveChild</code> and no <code>[expensive]</code>. Memo successfully prevented re-render.
      </p>
    </div>
  )
}
