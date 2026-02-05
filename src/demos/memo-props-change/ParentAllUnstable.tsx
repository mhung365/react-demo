import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { MemoizedCard } from './MemoizedCard'

/**
 * All props change by reference (or by value) every render:
 * - config = {{ theme: 'dark', pageSize: 10 }} → new object every render
 * - onAction = () => console.log(id) → new function every render
 * - count = {tick} → value changes when tick changes
 * - children = <span>{tick}</span> → new element every render
 * Console: [props] MemoizedCard — config, onAction, count, children all "broke memo" (ref or value changed).
 */
export function ParentAllUnstable() {
  const [tick, setTick] = useState(0)
  useRenderLog('ParentAllUnstable')

  return (
    <div className="memo-props-scenario memo-props-scenario--fails">
      <header className="memo-props-scenario__header">
        <h3>All props unstable (reference or value changes)</h3>
        <p>
          Parent passes inline <code>config={'{{ theme, pageSize }}'}</code>, inline <code>onAction</code>,{' '}
          <code>count={'{tick}'}</code>, and <code>children={'<span>{tick}</span>'}</code>. Every render: new object,
          new function, new count value, new children element. React.memo shallow-compares all props → every prop
          fails → child re-renders every time. Console shows which prop(s) broke memo.
        </p>
      </header>
      <div className="memo-props-scenario__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment (tick: {tick})
        </button>
      </div>
      <MemoizedCard
        id="card-1"
        count={tick}
        config={{ theme: 'dark', pageSize: 10 }}
        onAction={(id: string) => console.log('Action', id)}
      >
        <span>Tick: {tick}</span>
      </MemoizedCard>
      <p className="memo-props-hint">
        <strong>Console:</strong> <code>[props] MemoizedCard</code> — prop(s) that broke memo: config, onAction, count,
        children (ref or value changed). One changing prop invalidates memo; here all change.
      </p>
    </div>
  )
}
