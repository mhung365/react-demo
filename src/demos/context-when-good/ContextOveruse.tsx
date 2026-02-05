import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_USER, type Theme, type User } from './types'
import './context-when-good-demo.css'

/**
 * CONTEXT OVERUSE (ANTI-PATTERN): One AppContext with theme, user, sidebarOpen.
 *
 * When theme changes, the entire context value changes → EVERY consumer re-renders:
 * Layout, Sidebar, UserBadge, NavItem, Page, ThemedCard all re-render.
 *
 * UserBadge only needs user — it doesn't need theme. But it uses useContext(AppContext),
 * so it re-renders on every theme toggle. Unnecessary re-renders. Check console: 6+ logs per toggle.
 */

interface AppContextValue {
  theme: Theme
  user: User
  sidebarOpen: boolean
  setTheme: (t: Theme) => void
  setSidebarOpen: (v: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('Missing AppProvider')
  return ctx
}

function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [user] = useState<User>(MOCK_USER)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  useRenderLog('AppProvider (overuse)', { theme })

  const value = useMemo(
    () => ({ theme, user, sidebarOpen, setTheme, setSidebarOpen }),
    [theme, user, sidebarOpen]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

function LayoutOveruse({ children }: { children: ReactNode }) {
  useApp() // subscribe to whole context
  useRenderLog('Layout (context overuse)', {})

  return (
    <div className="ctx-demo__layout">
      <p className="ctx-demo__hint ctx-demo__hint--wrong">
        One AppContext — any change re-renders every consumer.
      </p>
      <SidebarOveruse />
      <main className="ctx-demo__main">
        <PageOveruse>{children}</PageOveruse>
      </main>
    </div>
  )
}

function SidebarOveruse() {
  useApp()
  useRenderLog('Sidebar (context overuse)', {})

  return (
    <aside className="ctx-demo__sidebar">
      <UserBadgeOveruse />
      <NavItemOveruse label="Home" />
      <NavItemOveruse label="Settings" />
    </aside>
  )
}

function UserBadgeOveruse() {
  const { user } = useApp()
  useRenderLog('UserBadge (context overuse)', { userId: user.id })

  return (
    <div className="ctx-demo__badge">
      <span>{user.name}</span> <span className="ctx-demo__role">{user.role}</span>
    </div>
  )
}

function NavItemOveruse({ label }: { label: string }) {
  const { theme } = useApp()
  useRenderLog('NavItem (context overuse)', { theme, label })

  return (
    <div className="ctx-demo__nav-item" data-theme={theme}>
      {label}
    </div>
  )
}

function PageOveruse({ children }: { children: ReactNode }) {
  useApp()
  useRenderLog('Page (context overuse)', {})

  return (
    <div className="ctx-demo__page">
      <ThemedCardOveruse />
      {children}
    </div>
  )
}

function ThemedCardOveruse() {
  const { theme, setTheme } = useApp()
  useRenderLog('ThemedCard (context overuse)', { theme })

  return (
    <div className="ctx-demo__card" data-theme={theme}>
      <p>Theme: {theme}</p>
      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
      <p className="ctx-demo__hint ctx-demo__hint--wrong">
        Toggle theme → UserBadge, Layout, Sidebar, Page all re-render (unnecessary). One context = broad re-renders.
      </p>
    </div>
  )
}

export function ContextOveruse() {
  return (
    <section className="ctx-demo ctx-demo--overuse">
      <header className="ctx-demo__section-header">
        <h2>Context overuse (anti-pattern)</h2>
        <p>
          One <strong>AppContext</strong> with theme, user, sidebarOpen. When theme changes, context value changes → <strong>every</strong> consumer re-renders: Layout, Sidebar, UserBadge, NavItem, Page, ThemedCard. UserBadge only needs user — it shouldn&apos;t re-render on theme toggle. Check console: 6+ <code>[render]</code> logs per toggle.
        </p>
      </header>
      <AppProvider>
        <LayoutOveruse>
          <div className="ctx-demo__extra" />
        </LayoutOveruse>
      </AppProvider>
    </section>
  )
}
