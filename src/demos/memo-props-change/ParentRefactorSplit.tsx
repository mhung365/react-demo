import { useState, useMemo, useCallback } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { MemoizedCard } from './MemoizedCard'
import type { CardConfig } from './types'

/**
 * Refactor: split prop responsibility so the memoized child receives ONLY stable props.
 * - MemoizedCard gets: id, config, onAction (all stable). It does NOT receive count or children.
 * - The changing data (tick/count) is shown by the PARENT (or a sibling), not passed into MemoizedCard.
 * So when tick changes, parent re-renders but MemoizedCard receives same props → memo skips.
 * This improves memo effectiveness: prop splitting / restructuring so the memo boundary only gets stable props.
 */
export function ParentRefactorSplit() {
  const [tick, setTick] = useState(0)
  useRenderLog('ParentRefactorSplit')

  const config = useMemo<CardConfig>(() => ({ theme: 'dark', pageSize: 10 }), [])
  const onAction = useCallback((id: string) => console.log('Action', id), [])

  return (
    <div className="memo-props-scenario memo-props-scenario--refactor">
      <header className="memo-props-scenario__header">
        <h3>Refactor: split props — memo gets only stable props</h3>
        <p>
          MemoizedCard receives only <code>id</code>, <code>config</code>, <code>onAction</code> (all stable). We do
          <strong> not</strong> pass <code>count</code> or <code>children</code>. The changing value (tick) is
          displayed by the parent in a separate div. When tick changes, parent re-renders but MemoizedCard gets same
          props → React.memo skips. Console: no <code>[render] MemoizedCard</code> on Increment.
        </p>
      </header>
      <div className="memo-props-scenario__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment (tick: {tick})
        </button>
      </div>
      <div className="memo-props-split">
        <div className="memo-props-split__cell">
          <h4>Changing data (parent)</h4>
          <span>tick: {tick}</span>
        </div>
        <div className="memo-props-split__cell">
          <h4>MemoizedCard (stable props only)</h4>
          <MemoizedCard id="card-1" count={0} config={config} onAction={onAction} />
        </div>
      </div>
      <p className="memo-props-hint">
        <strong>Console:</strong> Click Increment. You should see <code>[render] ParentRefactorSplit</code> only — no{' '}
        <code>[render] MemoizedCard</code>. Prop splitting: the memoized child no longer receives the changing prop;
        memo effectiveness restored.
      </p>
    </div>
  )
}
