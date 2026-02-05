import {
  createContext,
  useContext,
  useState,
  useMemo,
  memo,
  type ReactNode,
} from 'react'
import { useRenderLog } from './useRenderLog'
import './context-re-renders-demo.css'

/**
 * MEMOIZED CONSUMERS DO NOT HELP: Consumers wrapped in memo still re-render when context value changes.
 *
 * - Same AppContext; value is memoized (useMemo) so we only trigger on count/theme change, not "parent re-render with same state."
 * - CounterDisplay, CounterButton, ThemeDisplay are wrapped in memo. They receive no props (or static props).
 * - When count changes: Provider re-renders, value is new (useMemo deps: [count, theme]). All consumers that use useContext(AppContext) re-render — React re-renders them because the CONTEXT VALUE they read has changed. memo does NOT prevent this: memo only skips re-render when the component's PROPS are referentially equal. Context consumers re-render when the context VALUE (from the nearest Provider) changes; that is independent of props.
 * - So: ThemeDisplay is memo(ThemeDisplay), uses useApp(). When count changes, context value identity changes → ThemeDisplay re-renders. memo does nothing. Prove it with render logs.
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

  const value = useMemo<AppContextValue>(
    () => ({ count, theme, setCount, setTheme }),
    [count, theme]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

const CounterDisplay = memo(function CounterDisplay() {
  const { count } = useApp()
  useRenderLog('CounterDisplay (memo, consumer)', { count })

  return (
    <div className="ctx-rerender__block">
      <p>Count: {count}</p>
    </div>
  )
})

const CounterButton = memo(function CounterButton() {
  const { count, setCount } = useApp()
  useRenderLog('CounterButton (memo, consumer)', { count })

  return (
    <div className="ctx-rerender__block">
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
})

const ThemeDisplay = memo(function ThemeDisplay() {
  const { theme } = useApp()
  useRenderLog('ThemeDisplay (memo, consumer)', { theme })

  return (
    <div className="ctx-rerender__block">
      <p>Theme: {theme}</p>
      <p className="ctx-rerender__hint ctx-rerender__hint--wrong">
        memo does NOT prevent Context-triggered re-renders. When context value identity changes, React re-renders this consumer — props are irrelevant. Click Increment: this still logs.
      </p>
    </div>
  )
})

export function MemoizedConsumersNoHelp() {
  return (
    <section className="ctx-rerender ctx-rerender--memo-no-help">
      <header className="ctx-rerender__section-header">
        <h2>Memoizing consumers does NOT prevent Context-triggered re-renders</h2>
        <p>
          CounterDisplay, CounterButton, ThemeDisplay are wrapped in <strong>memo</strong>. Provider value is <strong>useMemo</strong> so value identity only changes when count or theme changes. When you click Increment: context value identity changes → <strong>all consumers re-render</strong>. memo only skips re-render when <strong>props</strong> are referentially equal; Context-triggered re-renders are caused by the context <strong>value</strong> changing, not props. So ThemeDisplay (memo) still re-renders. Check console.
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
