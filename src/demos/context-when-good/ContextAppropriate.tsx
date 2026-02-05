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
 * CONTEXT USED APPROPRIATELY: Split ThemeContext and UserContext.
 *
 * - Theme: needed by NavItem, ThemedCard (and ThemeToggle). ThemeProvider wraps the tree that needs theme.
 * - User: needed by UserBadge. UserProvider wraps the tree.
 *
 * When theme changes, only ThemeContext consumers re-render (NavItem, ThemedCard). UserBadge does NOT re-render (it uses UserContext). Clarity: no drilling theme/user through Layout, Sidebar, Main, Page. Scoped: each context has a clear purpose.
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

function LayoutAppropriate({ children }: { children: ReactNode }) {
  useRenderLog('Layout (context appropriate)', {})

  return (
    <div className="ctx-demo__layout">
      <p className="ctx-demo__hint ctx-demo__hint--correct">
        Layout: no theme/user props. Context consumers read what they need.
      </p>
      <SidebarAppropriate />
      <main className="ctx-demo__main">
        <PageAppropriate>{children}</PageAppropriate>
      </main>
    </div>
  )
}

function SidebarAppropriate() {
  useRenderLog('Sidebar (context appropriate)', {})

  return (
    <aside className="ctx-demo__sidebar">
      <UserBadgeAppropriate />
      <NavItemAppropriate label="Home" />
      <NavItemAppropriate label="Settings" />
    </aside>
  )
}

function UserBadgeAppropriate() {
  const { user } = useUser()
  useRenderLog('UserBadge (UserContext)', { userId: user.id })

  return (
    <div className="ctx-demo__badge">
      <span>{user.name}</span> <span className="ctx-demo__role">{user.role}</span>
    </div>
  )
}

function NavItemAppropriate({ label }: { label: string }) {
  const { theme } = useTheme()
  useRenderLog('NavItem (ThemeContext)', { theme, label })

  return (
    <div className="ctx-demo__nav-item" data-theme={theme}>
      {label}
    </div>
  )
}

function PageAppropriate({ children }: { children: ReactNode }) {
  useRenderLog('Page (context appropriate)', {})

  return (
    <div className="ctx-demo__page">
      <ThemedCardAppropriate />
      {children}
    </div>
  )
}

function ThemedCardAppropriate() {
  const { theme, setTheme } = useTheme()
  useRenderLog('ThemedCard (ThemeContext)', { theme })

  return (
    <div className="ctx-demo__card" data-theme={theme}>
      <p>Theme: {theme}</p>
      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
      <p className="ctx-demo__hint ctx-demo__hint--correct">
        Split contexts: theme and user are separate. No drilling theme/user through Layout. (ThemeProvider wraps the app here so the subtree re-renders on theme change; scope Provider to only branches that need theme to narrow re-renders.)
      </p>
    </div>
  )
}

export function ContextAppropriate() {
  return (
    <section className="ctx-demo ctx-demo--appropriate">
      <header className="ctx-demo__section-header">
        <h2>Context used appropriately</h2>
        <p>
          <strong>ThemeContext</strong> and <strong>UserContext</strong> split. Theme needed by NavItem, ThemedCard; user by UserBadge. No drilling theme/user through Layout, Sidebar, Page — consumers use useTheme() or useUser(). Split contexts keep concerns separate; one big context would re-render every consumer on any change (see Overuse). Clear and scoped.
        </p>
      </header>
      <UserProvider>
        <ThemeProvider>
          <LayoutAppropriate>
            <div className="ctx-demo__extra" />
          </LayoutAppropriate>
        </ThemeProvider>
      </UserProvider>
    </section>
  )
}
