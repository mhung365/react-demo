import { useState, memo } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useIdentityLog } from './useIdentityLog'
import type { FilterConfig } from './types'

/**
 * Parent creates new config and items on every render (inline object/array).
 * Memoized child receives new references every time → memo never skips → re-render cascade.
 */
const MemoizedFilterPanel = memo(function MemoizedFilterPanel({
  config,
  items,
  onApply,
}: {
  config: FilterConfig
  items: number[]
  onApply: () => void
}) {
  useRenderLog('MemoizedFilterPanel (memo child)')
  return (
    <div className="identity-block identity-block--child">
      <p>config.theme = {config.theme}, items.length = {items.length}</p>
      <button type="button" onClick={onApply}>Apply (stable callback in refactor)</button>
    </div>
  )
})

export function InlineBreaksMemo() {
  const [count, setCount] = useState(0)
  useRenderLog('InlineBreaksMemo (parent)')

  // New object every render — same content, new reference
  const config: FilterConfig = { theme: 'dark', pageSize: 10, sortBy: 'name' }
  // New array every render
  const items = [1, 2, 3]

  useIdentityLog('parent config', config)
  useIdentityLog('parent items', items)

  return (
    <div className="identity-scenario identity-scenario--problem">
      <div className="identity-scenario__header">
        <h3>1. Inline objects/arrays break memoization</h3>
        <p>
          Parent passes <code>config</code> and <code>items</code> created inline. Every parent
          re-render creates new references → memoized child always sees “new” props → re-renders.
        </p>
      </div>
      <div className="identity-scenario__measure">
        Click “Increment”. Console: [identity] config/items show NEW reference every time;
        [render] MemoizedFilterPanel runs every time (memo does not skip).
      </div>
      <button type="button" className="identity-btn" onClick={() => setCount((c) => c + 1)}>
        Increment ({count})
      </button>
      <MemoizedFilterPanel
        config={config}
        items={items}
        onApply={() => console.log('Apply')}
      />
      <div className="identity-hint identity-hint--bad">
        <strong>Why:</strong> React.memo uses shallow comparison (prevProps.config ===
        nextProps.config). Inline <code>{`{ theme: 'dark', ... }`}</code> creates a new object each
        render, so the reference is never equal. Same for <code>[1, 2, 3]</code>. Values “look the
        same” but identities differ.
      </div>
    </div>
  )
}
