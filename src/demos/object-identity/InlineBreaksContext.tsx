import { createContext, useContext, useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useIdentityLog } from './useIdentityLog'
import type { ThemeContextValue } from './types'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function ThemeConsumer() {
  const ctx = useContext(ThemeContext)
  useRenderLog('ThemeConsumer (Context consumer)')
  if (!ctx) return null
  return (
    <div className="identity-block identity-block--child">
      <p>Theme: {ctx.theme}</p>
      <button type="button" onClick={() => ctx.setTheme('light')}>Set light</button>
    </div>
  )
}

/**
 * Provider passes value={{ theme, setTheme }} — new object every render.
 * All consumers re-render whenever the parent re-renders, even if theme did not change.
 */
export function InlineBreaksContext() {
  const [theme, setTheme] = useState('dark')
  const [count, setCount] = useState(0)
  useRenderLog('InlineBreaksContext (Provider parent)')

  const value: ThemeContextValue = { theme, setTheme }
  useIdentityLog('Context value', value)

  return (
    <div className="identity-scenario identity-scenario--problem">
      <div className="identity-scenario__header">
        <h3>3. Inline Context value causes all consumers to re-render</h3>
        <p>
          <code>ThemeContext.Provider value={'{'} {`{ theme, setTheme }`} {'}'}</code> creates a
          new object every render. Context compares by reference → consumers re-render every time
          the provider’s parent re-renders.
        </p>
      </div>
      <div className="identity-scenario__measure">
        Click “Increment” (does not change theme). Console: [identity] Context value = NEW
        reference; [render] ThemeConsumer runs every time.
      </div>
      <button type="button" className="identity-btn" onClick={() => setCount((c) => c + 1)}>
        Increment ({count})
      </button>
      <ThemeContext.Provider value={value}>
        <ThemeConsumer />
      </ThemeContext.Provider>
      <div className="identity-hint identity-hint--bad">
        <strong>Why:</strong> Context uses reference equality to decide whether to notify
        subscribers. New object every render → “value changed” → all consumers re-render. Fix:
        useMemo for the value object: <code>{'useMemo(() => ({ theme, setTheme }), [theme])'}</code> (and
        setTheme stable via useState setter).
      </div>
    </div>
  )
}
