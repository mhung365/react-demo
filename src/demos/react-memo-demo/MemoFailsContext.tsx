import { createContext, useState, useCallback, useMemo, useRef, useContext, memo } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { usePropReferenceLog } from '../expensive-child/usePropReferenceLog'
import type { ChildConfig, ExpensiveChildProps } from './types'

const ITEMS = 8000
function simulateExpensiveWork(): number {
  const start = performance.now()
  let sum = 0
  for (let i = 0; i < ITEMS; i++) sum += Math.sqrt(i) * Math.random()
  return performance.now() - start
}

type ThemeContextValue = { theme: string }
const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark' })

/**
 * Same idea as ExpensiveChild but SUBSCRIBES to ThemeContext.
 * React.memo does NOT prevent re-renders triggered by Context updates.
 * When the context value (theme) changes, React re-renders all consumers — memo only compares PROPS.
 * The re-render here is caused by the context subscription, not by "parent passed new props".
 */
interface ExpensiveChildWithContextProps extends ExpensiveChildProps {}

const ExpensiveChildWithContextInner = memo(function ExpensiveChildWithContextInner({
  config,
  onSubmit,
}: ExpensiveChildWithContextProps) {
  const theme = useContext(ThemeContext)
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  useRenderLog('ExpensiveChild (memo + useContext)', { renderCount })
  usePropReferenceLog('ExpensiveChild (context consumer)', { config, onSubmit }, ['config', 'onSubmit'])

  const ms = simulateExpensiveWork()
  console.log(
    `[expensive] ExpensiveChild (context) render #${renderCount} — ${ms.toFixed(2)}ms — re-rendered because CONTEXT (theme) changed, not props`
  )

  return (
    <div className="memo-expensive-child" data-testid="expensive-child-context">
      <div className="memo-expensive-child__meta">
        <span className="label">ExpensiveChild (memo + useContext)</span>
        <span className="render-count">Render #{renderCount}</span>
        <span className="config">theme from context: {theme.theme} | config: {config.theme}</span>
      </div>
      <button type="button" onClick={() => onSubmit(`submit-${renderCount}`)} className="memo-expensive-child__submit">
        Submit
      </button>
    </div>
  )
})

/**
 * Scenario: React.memo FAILS to prevent re-renders triggered by Context.
 * Parent passes STABLE config and onSubmit (useMemo/useCallback). Child is memo'd.
 * But child uses useContext(ThemeContext). When parent updates theme state → context value changes →
 * React re-renders ALL consumers of that context. Memo only skips when re-render is caused by
 * "parent re-rendered and passed same props". Here the re-render is caused by "context value changed" —
 * memo does NOT run its comparison for that; the component re-renders because of its subscription.
 */
export function MemoFailsContext() {
  const [theme, setTheme] = useState('dark')
  useRenderLog('Parent (MemoFailsContext)')

  const config = useMemo<ChildConfig>(() => ({ theme: 'dark', pageSize: 10 }), [])
  const onSubmit = useCallback((value: string) => console.log('Submitted:', value), [])

  const contextValue = useMemo(() => ({ theme }), [theme])

  return (
    <div className="memo-scenario memo-scenario--fails">
      <header className="memo-scenario__header">
        <h3>Memo fails: Context updates</h3>
        <p>
          Parent passes stable config and onSubmit. Child is memo'd and uses <code>useContext(ThemeContext)</code>.
          When you click &quot;Change theme&quot;, context value changes → React re-renders all context consumers.
          Memo does NOT prevent that — memo only compares props; re-renders triggered by Context (or state) are
          not &quot;parent passed new props&quot;, they are &quot;subscription fired&quot;.
        </p>
      </header>
      <div className="memo-scenario__actions">
        <button type="button" className="primary" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
          Change theme (current: {theme})
        </button>
      </div>
      <ThemeContext.Provider value={contextValue}>
        <ExpensiveChildWithContextInner config={config} onSubmit={onSubmit} />
      </ThemeContext.Provider>
      <p className="memo-hint">
        <strong>Console:</strong> Click &quot;Change theme&quot;. <code>[props]</code> may show reference equal: true (props
        didn&apos;t change), but <code>[render] ExpensiveChild (context)</code> and <code>[expensive]</code> still run.
        Memo does NOT stop renders triggered by Context (or by state inside the component).
      </p>
    </div>
  )
}
