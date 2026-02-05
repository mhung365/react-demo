import { useState } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_USER, type Theme, type User } from './types'
import './context-when-good-demo.css'

/**
 * PROPS DRILLING BECOMES NOISY: theme + user passed through 5–6 levels.
 *
 * Dashboard → Layout → Sidebar → NavItem (needs theme)
 * Dashboard → Layout → Main → Page → ThemedCard (needs theme)
 * Dashboard → Layout → Sidebar → UserBadge (needs user)
 *
 * Every intermediate must accept and forward theme, user, setTheme. Noisy: long prop lists,
 * easy to forget a level or pass wrong prop. Error-prone when adding another "global" (e.g. locale).
 */

function Layout({
  theme,
  user,
  setTheme,
  children,
}: {
  theme: Theme
  user: User
  setTheme: (t: Theme) => void
  children: React.ReactNode
}) {
  useRenderLog('Layout (props)', { theme })
  return (
    <div className="ctx-demo__layout">
      <p className="ctx-demo__hint ctx-demo__hint--wrong">
        Layout: forwards theme, user, setTheme — does not use them. Noisy prop list.
      </p>
      <Sidebar theme={theme} user={user} setTheme={setTheme} />
      <Main theme={theme} setTheme={setTheme}>{children}</Main>
    </div>
  )
}

function Sidebar({
  theme,
  user,
  setTheme,
}: {
  theme: Theme
  user: User
  setTheme: (t: Theme) => void
}) {
  useRenderLog('Sidebar (props)', { theme })
  return (
    <aside className="ctx-demo__sidebar">
      <UserBadge user={user} />
      <NavItem theme={theme} label="Home" />
      <NavItem theme={theme} label="Settings" />
    </aside>
  )
}

function UserBadge({ user }: { user: User }) {
  useRenderLog('UserBadge (props)', { userId: user.id })
  return (
    <div className="ctx-demo__badge">
      <span>{user.name}</span> <span className="ctx-demo__role">{user.role}</span>
    </div>
  )
}

function NavItem({ theme, label }: { theme: Theme; label: string }) {
  useRenderLog('NavItem (props)', { theme, label })
  return (
    <div className="ctx-demo__nav-item" data-theme={theme}>
      {label}
    </div>
  )
}

function Main({
  theme,
  setTheme,
  children,
}: {
  theme: Theme
  setTheme: (t: Theme) => void
  children: React.ReactNode
}) {
  useRenderLog('Main (props)', { theme })
  return (
    <main className="ctx-demo__main">
      <Page theme={theme} setTheme={setTheme}>{children}</Page>
    </main>
  )
}

function Page({
  theme,
  setTheme,
  children,
}: {
  theme: Theme
  setTheme: (t: Theme) => void
  children: React.ReactNode
}) {
  useRenderLog('Page (props)', { theme })
  return (
    <div className="ctx-demo__page">
      <ThemedCard theme={theme} setTheme={setTheme} />
      {children}
    </div>
  )
}

function ThemedCard({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  useRenderLog('ThemedCard (props)', { theme })
  return (
    <div className="ctx-demo__card" data-theme={theme}>
      <p>Theme: {theme}</p>
      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
    </div>
  )
}

export function PropsDrillingNoisy() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [user] = useState<User>(MOCK_USER)
  useRenderLog('Dashboard (props)', { theme })

  return (
    <section className="ctx-demo ctx-demo--noisy">
      <header className="ctx-demo__section-header">
        <h2>Props drilling: noisy and error-prone</h2>
        <p>
          <strong>theme</strong> and <strong>user</strong> passed through Layout → Sidebar → NavItem / UserBadge, and Layout → Main → Page → ThemedCard. Every level must accept and forward. Long prop lists; easy to forget a level or add wrong prop. Adding locale would mean touching 6+ components. Toggle theme — check console: whole path re-renders.
        </p>
      </header>
      <Layout theme={theme} user={user} setTheme={setTheme}>
        <div className="ctx-demo__extra" />
      </Layout>
    </section>
  )
}
