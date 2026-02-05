import { useState, useRef, useMemo, useCallback } from 'react'
import { ExpensiveChild } from './ExpensiveChild'
import type { ChildConfig } from './types'

/**
 * FIXED: Stable references via useMemo and useCallback.
 * When ParentFixed re-renders (e.g. setCount), ExpensiveChild receives:
 * - config = same object reference (useMemo with [] deps)
 * - onSubmit = same function reference (useCallback with [] deps)
 * React.memo(ExpensiveChild) does shallow compare: config === prevConfig → true,
 * so the child does NOT re-render. Only the parent and its direct output re-run.
 */
export function ParentFixed() {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  const [count, setCount] = useState(0)

  const config = useMemo<ChildConfig>(
    () => ({ theme: 'dark', pageSize: 10 }),
    []
  )

  const onSubmit = useCallback((value: string) => {
    console.log('Submitted:', value)
  }, [])

  console.log(`[render] ParentFixed #${renderCount}`)

  return (
    <div className="parent parent-fixed" data-testid="parent-fixed">
      <div className="parent__header">
        <h3>Fixed (useMemo + useCallback)</h3>
        <p>Parent state: {count}, render count: {renderCount}. Click Increment → parent re-renders but child gets SAME refs → ExpensiveChild does NOT re-run (memo skips).</p>
      </div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment parent state
      </button>
      <ExpensiveChild config={config} onSubmit={onSubmit} />
    </div>
  )
}
