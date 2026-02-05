import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useRenderLog } from './useRenderLog'
import './context-re-renders-demo.css'

/**
 * UNSTABLE PROVIDER VALUE: value = new object every render.
 *
 * - AppContext holds { count, theme, setCount, setTheme }.
 * - Provider: value = { count, theme, setCount, setTheme } — NO useMemo. Every time the Provider's parent re-renders (e.g. state update), value is a NEW object (new identity).
 * - React compares context value by reference (Object.is). New object → all consumers re-render.
 * - So: click "Increment" → Provider re-renders → value is new object → CounterDisplay, CounterButton, ThemeDisplay ALL re-render. ThemeDisplay doesn't need count — but it re-renders because the context VALUE (the object) changed identity.
 */

interface AppContextValue {
  count: number
  theme: 'light' | 'dark'
  setCount: (n: number) => void
  setTheme: (t: 'light' | 'dark') => void
}

const AppContext = createContext<AppContextValue | null>(null)

function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('Missing AppProvider')
  return ctx
}

function AppProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useRenderLog('AppProvider', { count, theme })

  // BUG: New object every render — all consumers re-render when Provider re-renders
  const value: AppContextValue = {
    count,
    theme,
    setCount,
    setTheme,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

function CounterDisplay() {
  const { count } = useApp()
  useRenderLog('CounterDisplay (consumer)', { count })

  return (
    <div className="ctx-rerender__block">
      <p>Count: {count}</p>
    </div>
  )
}

function CounterButton() {
  const { count, setCount } = useApp()
  useRenderLog('CounterButton (consumer)', { count })

  return (
    <div className="ctx-rerender__block">
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

function ThemeDisplay() {
  const { theme } = useApp()
  useRenderLog('ThemeDisplay (consumer)', { theme })

  return (
    <div className="ctx-rerender__block">
      <p>Theme: {theme}</p>
      <p className="ctx-rerender__hint ctx-rerender__hint--wrong">
        Does not need count — but re-renders on every increment (value object identity changed).
      </p>
    </div>
  )
}

export function UnstableProviderValue() {
  return (
    <section className="ctx-rerender ctx-rerender--unstable">
      <header className="ctx-rerender__section-header">
        <h2>Unstable Provider value (any change → all consumers re-render)</h2>
        <p>
          Provider value = <code>{`{ count, theme, setCount, setTheme }`}</code> — <strong>no useMemo</strong>. Every render creates a new object. React compares context value by <strong>reference (Object.is)</strong>. New object → all consumers re-render. Click Increment: AppProvider, CounterDisplay, CounterButton, <strong>ThemeDisplay</strong> all log — ThemeDisplay doesn&apos;t need count.
        </p>
      </header>
      <AppProvider>
        <CounterDisplay />
        <CounterButton />
        <ThemeDisplay />
      </AppProvider>
    </section>
  )
}
