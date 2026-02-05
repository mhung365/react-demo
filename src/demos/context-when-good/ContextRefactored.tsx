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
 * REFACTORED: Split contexts (ThemeContext, UserContext) so each consumer only re-renders when its slice changes.
 *
 * Same as ContextAppropriate but we explicitly contrast with ContextOveruse: we had one AppContext → every consumer re-rendered on any change. Refactor: split into ThemeContext and UserContext. Now theme toggle → only ThemeContext consumers (NavItem, ThemedCard) re-render. UserBadge (UserContext) does not. Safer, scoped design.
 */

type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void }
type UserContextValue = { user: User }

const ThemeContext = createContext<ThemeContextValue | null>(null)
const UserContext = createContext<UserContextValue | null>(null)

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('Missing ThemeProvider')
  return ctx
}

function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('Missing UserProvider')
  return ctx
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const value = useMemo(() => ({ theme, setTheme }), [theme])
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function UserProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User>(MOCK_USER)
  const value = useMemo(() => ({ user }), [user])
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

function LayoutRefactored({ children }: { children: ReactNode }) {
  useRenderLog('Layout (refactored)', {})

  return (
    <div className="ctx-demo__layout">
      <p className="ctx-demo__hint ctx-demo__hint--correct">
        Split contexts: Layout does not subscribe to theme or user — re-renders only when parent re-renders (rare).
      </p>
      <SidebarRefactored />
      <main className="ctx-demo__main">
        <PageRefactored>{children}</PageRefactored>
      </main>
    </div>
  )
}

function SidebarRefactored() {
  useRenderLog('Sidebar (refactored)', {})

  return (
    <aside className="ctx-demo__sidebar">
      <UserBadgeRefactored />
      <NavItemRefactored label="Home" />
      <NavItemRefactored label="Settings" />
    </aside>
  )
}

function UserBadgeRefactored() {
  const { user } = useUser()
  useRenderLog('UserBadge (UserContext)', { userId: user.id })

  return (
    <div className="ctx-demo__badge">
      <span>{user.name}</span> <span className="ctx-demo__role">{user.role}</span>
    </div>
  )
}

function NavItemRefactored({ label }: { label: string }) {
  const { theme } = useTheme()
  useRenderLog('NavItem (ThemeContext)', { theme, label })

  return (
    <div className="ctx-demo__nav-item" data-theme={theme}>
      {label}
    </div>
  )
}

function PageRefactored({ children }: { children: ReactNode }) {
  useRenderLog('Page (refactored)', {})

  return (
    <div className="ctx-demo__page">
      <ThemedCardRefactored />
      {children}
    </div>
  )
}

function ThemedCardRefactored() {
  const { theme, setTheme } = useTheme()
  useRenderLog('ThemedCard (ThemeContext)', { theme })

  return (
    <div className="ctx-demo__card" data-theme={theme}>
      <p>Theme: {theme}</p>
      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
      <p className="ctx-demo__hint ctx-demo__hint--correct">
        Refactored from one AppContext: split ThemeContext + UserContext. Each consumer subscribes only to what it needs; one big context re-renders everyone (see Overuse).
      </p>
    </div>
  )
}

export function ContextRefactored() {
  return (
    <section className="ctx-demo ctx-demo--refactored">
      <header className="ctx-demo__section-header">
        <h2>Refactored: scoped, split contexts</h2>
        <p>
          Replaced one <strong>AppContext</strong> with <strong>ThemeContext</strong> and <strong>UserContext</strong>. Each consumer subscribes only to what it needs. Split contexts so each consumer subscribes only to what it needs. One AppContext (Overuse) re-renders every consumer on any change; split ThemeContext + UserContext keeps concerns separate. Safer, scoped design. Check console: Overuse = 6+ logs per toggle.
        </p>
      </header>
      <UserProvider>
        <ThemeProvider>
          <LayoutRefactored>
            <div className="ctx-demo__extra" />
          </LayoutRefactored>
        </ThemeProvider>
      </UserProvider>
    </section>
  )
}
