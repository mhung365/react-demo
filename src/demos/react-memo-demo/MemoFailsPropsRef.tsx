import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { ExpensiveChild } from './ExpensiveChild'

/**
 * Scenario: React.memo FAILS — changing prop references (inline object/function).
 * Parent passes config={{ theme: 'dark', pageSize: 10 }} and onSubmit={() => {...}} →
 * NEW object and NEW function every render → shallow compare: prev !== next → re-render.
 * Console: [props] ExpensiveChild shows reference equal: false for config/onSubmit.
 */
export function MemoFailsPropsRef() {
  const [tick, setTick] = useState(0)
  useRenderLog('Parent (MemoFailsPropsRef)')

  return (
    <div className="memo-scenario memo-scenario--fails">
      <header className="memo-scenario__header">
        <h3>Memo fails: changing prop references (inline object/function)</h3>
        <p>
          Parent passes inline <code>{`config={{ theme: 'dark', pageSize: 10 }}`}</code> and{' '}
          <code>{`onSubmit={() => console.log(...)}`}</code>. Every render creates NEW object and NEW function →
          React.memo shallow-compare sees prevProps.config !== nextProps.config → child re-renders every time.
        </p>
      </header>
      <div className="memo-scenario__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment parent state (tick: {tick})
        </button>
      </div>
      <ExpensiveChild
        config={{ theme: 'dark', pageSize: 10 }}
        onSubmit={(value: string) => console.log('Submitted:', value)}
      />
      <p className="memo-hint">
        <strong>Console:</strong> <code>[props] ExpensiveChild</code> shows <code>reference equal: false</code> for config and
        onSubmit. <code>[expensive]</code> runs every click. Memo does NOT prevent re-render when props are new refs.
      </p>
    </div>
  )
}
