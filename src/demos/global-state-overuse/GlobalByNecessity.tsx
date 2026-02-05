import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { useRenderLog } from './useRenderLog'
import './global-state-demo.css'

/**
 * GLOBAL BY NECESSITY: Only state that is truly app-wide and has few/coarse consumers.
 *
 * - Theme (or "current user name") is in ThemeContext. Only Header and ThemeToggle consume.
 * - When theme changes, only those 2 components re-render. We do NOT put sidebar, step, search, or selection here.
 * - Global state is justified when: (1) many distant components need it (theme, user), (2) updates are coarse (theme toggle, login), (3) few consumers or consumers are leaves.
 */

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('Missing ThemeProvider')
  return ctx
}

function HeaderWithTheme() {
  const { theme } = useTheme()
  useRenderLog('Header (theme context)', { theme })

  return (
    <header className="global-demo__header global-demo__header--necessity">
      <span>App (theme is global by necessity)</span>
      <span className="global-demo__theme-badge">{theme}</span>
    </header>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  useRenderLog('ThemeToggle (theme context)', { theme })

  return (
    <div className="global-demo__search">
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        Toggle theme (current: {theme})
      </button>
      <p className="global-demo__hint global-demo__hint--correct">
        Only Header and ThemeToggle consume theme. Toggling re-renders only these 2 — not a whole dashboard.
      </p>
    </div>
  )
}

function UnrelatedPanel() {
  useRenderLog('UnrelatedPanel (no context)', {})

  return (
    <div className="global-demo__step-wizard">
      <p>This panel does not use theme context.</p>
      <p className="global-demo__hint">It does NOT re-render when theme toggles.</p>
    </div>
  )
}

export function GlobalByNecessity() {
  return (
    <section className="global-demo global-demo--necessity">
      <header className="global-demo__section-header">
        <h2>Global by necessity</h2>
        <p>
          Only <strong>theme</strong> is in Context — state that is truly app-wide and has few consumers (Header, ThemeToggle). ThemeProvider wraps only those; UnrelatedPanel is <strong>outside</strong> the provider so it does not re-render when theme toggles. Toggle theme: only Header and ThemeToggle log <code>[render]</code>. We do <strong>not</strong> put sidebar, step, search, or selection here. Global state is justified when many distant components need it and updates are coarse.
        </p>
      </header>
      <div className="global-demo__layout global-demo__layout--stack">
        <ThemeProvider>
          <HeaderWithTheme />
          <ThemeToggle />
        </ThemeProvider>
        <UnrelatedPanel />
      </div>
    </section>
  )
}
