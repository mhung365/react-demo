import { useState, useMemo, useCallback } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { MemoizedCard } from './MemoizedCard'
import type { CardConfig } from './types'

/**
 * Only ONE prop changes: count = {tick}. config and onAction are stable (useMemo/useCallback).
 * No children. So when tick changes, only "count" changes (by value).
 * React.memo compares all props; count: prevCount !== nextCount → memo fails.
 * Console: [props] MemoizedCard — "count: refEqual=false" (or value changed) — single prop invalidates memo.
 */
export function ParentSingleChanging() {
  const [tick, setTick] = useState(0)
  useRenderLog('ParentSingleChanging')

  const config = useMemo<CardConfig>(() => ({ theme: 'dark', pageSize: 10 }), [])
  const onAction = useCallback((id: string) => console.log('Action', id), [])

  return (
    <div className="memo-props-scenario memo-props-scenario--fails">
      <header className="memo-props-scenario__header">
        <h3>Single changing prop invalidates memo</h3>
        <p>
          Parent passes stable <code>config</code> (useMemo) and <code>onAction</code> (useCallback). Only{' '}
          <code>count={'{tick}'}</code> changes when you click. React.memo shallow-compares <strong>all</strong> props:
          one prop change (count) → memo fails → child re-renders. Prop shape: mixing stable and changing props in one
          component means the changing prop breaks memo for the whole component.
        </p>
      </header>
      <div className="memo-props-scenario__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment (tick: {tick})
        </button>
      </div>
      <MemoizedCard id="card-1" count={tick} config={config} onAction={onAction} />
      <p className="memo-props-hint">
        <strong>Console:</strong> <code>[props] MemoizedCard</code> — prop(s) that broke memo: <strong>count</strong> only.
        config and onAction are ref-equal; the single changing prop (count) invalidates memoization.
      </p>
    </div>
  )
}
