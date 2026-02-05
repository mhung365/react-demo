import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import { useRenderLog } from './useRenderLog'
import './context-re-renders-demo.css'

/**
 * REFACTORED: Split contexts so only the consumers that need the changed value re-render.
 *
 * - CountContext: { count, setCount }. CountProvider.
 * - ThemeContext: { theme, setTheme }. ThemeProvider.
 *
 * When count changes: CountProvider re-renders → CountContext value identity changes → only CounterDisplay and CounterButton (CountContext consumers) re-render. ThemeDisplay uses ThemeContext only → ThemeContext value did not change → ThemeDisplay does NOT re-render.
 *
 * Blast radius reduced: ThemeDisplay no longer re-renders on increment. Object identity: each Provider memoizes its value (useMemo) so value only changes when that slice changes.
 */

interface CountContextValue {
  count: number
  setCount: (n: number) => void
}

interface ThemeContextValue {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
}

const CountContext = createContext<CountContextValue | null>(null)
const ThemeContext = createContext<ThemeContextValue | null>(null)

function useCount(): CountContextValue {
  const ctx = useContext(CountContext)
  if (!ctx) throw new Error('Missing CountProvider')
  return ctx
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('Missing ThemeProvider')
  return ctx
}

function CountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  useRenderLog('CountProvider', { count })

  const value = useMemo(() => ({ count, setCount }), [count])

  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  )
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useRenderLog('ThemeProvider', { theme })

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function CounterDisplay() {
  const { count } = useCount()
  useRenderLog('CounterDisplay (CountContext)', { count })

  return (
    <div className="ctx-rerender__block">
      <p>Count: {count}</p>
    </div>
  )
}

function CounterButton() {
  const { count, setCount } = useCount()
  useRenderLog('CounterButton (CountContext)', { count })

  return (
    <div className="ctx-rerender__block">
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

function ThemeDisplay() {
  const { theme } = useTheme()
  useRenderLog('ThemeDisplay (ThemeContext only)', { theme })

  return (
    <div className="ctx-rerender__block">
      <p>Theme: {theme}</p>
      <p className="ctx-rerender__hint ctx-rerender__hint--correct">
        Uses ThemeContext only. When count changes, ThemeContext value does not change → this component does NOT re-render. Blast radius reduced.
      </p>
    </div>
  )
}

export function RefactoredBlastRadius() {
  return (
    <section className="ctx-rerender ctx-rerender--refactored">
      <header className="ctx-rerender__section-header">
        <h2>Refactored: split contexts reduce blast radius</h2>
        <p>
          <strong>CountContext</strong> (count, setCount) and <strong>ThemeContext</strong> (theme, setTheme) split. CounterDisplay and CounterButton use useCount(); ThemeDisplay uses useTheme() only. When you click Increment: only CountProvider, CounterDisplay, CounterButton re-render. <strong>ThemeDisplay does NOT re-render</strong> — ThemeContext value did not change. Check console: 3 logs (count path) vs 4+ with one context.
        </p>
      </header>
      <CountProvider>
        <ThemeProvider>
          <CounterDisplay />
          <CounterButton />
          <ThemeDisplay />
        </ThemeProvider>
      </CountProvider>
    </section>
  )
}
