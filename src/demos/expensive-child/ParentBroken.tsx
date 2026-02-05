import { useState, useRef } from 'react'
import { ExpensiveChild } from './ExpensiveChild'

/**
 * BROKEN: Passes inline object and inline function.
 * Every time ParentBroken re-renders (e.g. setCount), it creates:
 * - config = { theme: 'dark', pageSize: 10 }  → NEW object reference
 * - onSubmit = (value) => { ... }             → NEW function reference
 * React.memo(ExpensiveChild) does shallow compare: config === prevConfig → false, so
 * the child re-renders every time even though the VALUES (theme, pageSize, function behavior)
 * are the same. "Props look the same" but "props are NOT referentially equal".
 */
export function ParentBroken() {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  const [count, setCount] = useState(0)

  console.log(`[render] ParentBroken #${renderCount}`)

  return (
    <div className="parent parent-broken" data-testid="parent-broken">
      <div className="parent__header">
        <h3>Broken (inline object + inline function)</h3>
        <p>Parent state: {count}, render count: {renderCount}. Click Increment → parent re-renders → child gets new refs → ExpensiveChild re-runs every time.</p>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment parent state
      </button>
      <ExpensiveChild
        config={{ theme: 'dark', pageSize: 10 }}
        onSubmit={(value) => {
          console.log('Submitted:', value)
        }}
      />
    </div>
  )
}
