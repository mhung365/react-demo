import { useState, memo, useMemo, useCallback } from 'react'
import { createContext, useContext } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useIdentityLog } from './useIdentityLog'
import type { FilterConfig, ThemeContextValue } from './types'

const ThemeContext = createContext<ThemeContextValue | null>(null)

const MemoizedFilterPanel = memo(function MemoizedFilterPanel({
  config,
  items,
  onApply,
}: {
  config: FilterConfig
  items: number[]
  onApply: () => void
}) {
  useRenderLog('MemoizedFilterPanel (memo child, stable props)')
  return (
    <div className="identity-block identity-block--child">
      <p>config.theme = {config.theme}, items.length = {items.length}</p>
      <button type="button" onClick={onApply}>Apply</button>
    </div>
  )
})

function ThemeConsumer() {
  const ctx = useContext(ThemeContext)
  useRenderLog('ThemeConsumer (stable context value)')
  if (!ctx) return null
  return (
    <div className="identity-block identity-block--child">
      <p>Theme: {ctx.theme}</p>
      <button type="button" onClick={() => ctx.setTheme('light')}>Set light</button>
    </div>
  )
}

/**
 * Refactor: stabilize identities with useMemo (config, items), useCallback (onApply),
 * and useMemo for Context value. Memo child skips when only count changes; effect
 * runs only when config content changes; Context consumer skips when theme unchanged.
 */
export function StableIdentities() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState('dark')
  useRenderLog('StableIdentities (parent)')

  const config = useMemo<FilterConfig>(
    () => ({ theme: 'dark', pageSize: 10, sortBy: 'name' }),
    []
  )
  const items = useMemo(() => [1, 2, 3], [])
  const onApply = useCallback(() => console.log('Apply'), [])

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme]
  )

  useIdentityLog('config', config)
  useIdentityLog('items', items)
  useIdentityLog('contextValue', contextValue)

  return (
    <div className="identity-scenario identity-scenario--correct">
      <div className="identity-scenario__header">
        <h3>4. Refactor: stable identities</h3>
        <p>
          useMemo for config and items; useCallback for onApply; useMemo for Context value. Same
          references across re-renders when content has not changed → memo skips, effect runs
          only when deps change, consumers re-render only when theme changes.
        </p>
      </div>
      <div className="identity-scenario__measure">
        Click “Increment”. Console: [identity] config/items/contextValue = same reference;
        [render] MemoizedFilterPanel and ThemeConsumer do not run (or run only when theme
        changes for consumer).
      </div>
      <button type="button" className="identity-btn" onClick={() => setCount((c) => c + 1)}>
        Increment ({count})
      </button>
      <MemoizedFilterPanel config={config} items={items} onApply={onApply} />
      <ThemeContext.Provider value={contextValue}>
        <ThemeConsumer />
      </ThemeContext.Provider>
      <div className="identity-hint identity-hint--good">
        <strong>When to stabilize:</strong> When the value is passed to a memoized child, in a
        useEffect dependency array, or as Context value. useMemo/useCallback with correct deps
        keep identity stable when content has not changed.
      </div>
    </div>
  )
}
