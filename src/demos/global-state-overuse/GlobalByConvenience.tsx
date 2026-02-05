import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_USERS, type User, type WorkflowStep } from './types'
import './global-state-demo.css'

/**
 * GLOBAL BY CONVENIENCE: All UI state in one Context.
 *
 * - sidebarOpen, currentStep, searchQuery, selectedUserId live in AppStoreContext.
 * - Any component that uses useContext(AppStoreContext) re-renders when ANY of these change.
 * - Typing in search → Header, Sidebar, StepWizard, SearchPanel, UserList, UserDetail all re-render (6+ components).
 * - Toggling sidebar → same blast radius. Coupling: every consumer is coupled to the entire store.
 */

interface AppStoreState {
  sidebarOpen: boolean
  currentStep: WorkflowStep
  searchQuery: string
  selectedUserId: string | null
  setSidebarOpen: (v: boolean) => void
  setCurrentStep: (v: WorkflowStep) => void
  setSearchQuery: (v: string) => void
  setSelectedUserId: (v: string | null) => void
}

const AppStoreContext = createContext<AppStoreState | null>(null)

function useAppStore(): AppStoreState {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('Missing AppStoreProvider')
  return ctx
}

function AppStoreProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const value = useMemo<AppStoreState>(
    () => ({
      sidebarOpen,
      currentStep,
      searchQuery,
      selectedUserId,
      setSidebarOpen,
      setCurrentStep,
      setSearchQuery,
      setSelectedUserId,
    }),
    [sidebarOpen, currentStep, searchQuery, selectedUserId]
  )

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  )
}

function HeaderGlobal() {
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  useRenderLog('Header (global context)', { sidebarOpen })

  return (
    <header className="global-demo__header">
      <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? 'Hide' : 'Show'} sidebar
      </button>
      <span>Dashboard (global store)</span>
    </header>
  )
}

function SidebarGlobal() {
  const { sidebarOpen } = useAppStore()
  useRenderLog('Sidebar (global context)', { sidebarOpen })

  if (!sidebarOpen) return null
  return (
    <aside className="global-demo__sidebar">
      <p>Sidebar (re-renders on any context change)</p>
    </aside>
  )
}

function StepWizardGlobal() {
  const { currentStep, setCurrentStep } = useAppStore()
  useRenderLog('StepWizard (global context)', { currentStep })

  return (
    <div className="global-demo__step-wizard">
      <p>Step {currentStep} of 3</p>
      <div className="global-demo__step-buttons">
        {([1, 2, 3] as const).map((step) => (
          <button
            key={step}
            type="button"
            className={currentStep === step ? 'active' : ''}
            onClick={() => setCurrentStep(step)}
          >
            Step {step}
          </button>
        ))}
      </div>
      <p className="global-demo__hint">Re-renders when search/sidebar/selection change too.</p>
    </div>
  )
}

function SearchPanelGlobal() {
  const { searchQuery, setSearchQuery } = useAppStore()
  useRenderLog('SearchPanel (global context)', { searchQuery: searchQuery.slice(0, 20) })

  return (
    <div className="global-demo__search">
      <label>
        Search: <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type to see all consumers re-render"
        />
      </label>
    </div>
  )
}

function UserListGlobal() {
  const { searchQuery, selectedUserId, setSelectedUserId } = useAppStore()
  useRenderLog('UserList (global context)', { selectedUserId })

  const filtered = useMemo(
    () =>
      MOCK_USERS.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  )

  return (
    <div className="global-demo__user-list">
      <ul>
        {filtered.map((u) => (
          <li
            key={u.id}
            className={selectedUserId === u.id ? 'selected' : ''}
            onClick={() => setSelectedUserId(u.id)}
          >
            {u.name} — {u.role}
          </li>
        ))}
      </ul>
    </div>
  )
}

function UserDetailGlobal() {
  const { selectedUserId } = useAppStore()
  useRenderLog('UserDetail (global context)', { selectedUserId })

  const user = MOCK_USERS.find((u) => u.id === selectedUserId) ?? null

  return (
    <div className="global-demo__user-detail">
      {user ? (
        <p><strong>{user.name}</strong> — {user.role}</p>
      ) : (
        <p>Select a user</p>
      )}
      <p className="global-demo__hint global-demo__hint--wrong">
        Re-renders on every keystroke in search (unnecessary).
      </p>
    </div>
  )
}

export function GlobalByConvenience() {
  return (
    <section className="global-demo global-demo--wrong">
      <header className="global-demo__section-header">
        <h2>Global by convenience (anti-pattern)</h2>
        <p>
          All UI state (sidebar, step, search, selectedUser) in one Context. Any update re-renders <strong>every consumer</strong>. Type in search: Header, Sidebar, StepWizard, SearchPanel, UserList, UserDetail all log <code>[render]</code>. Toggle sidebar: same. Coupling and re-render scope are maximized.
        </p>
      </header>
      <AppStoreProvider>
        <div className="global-demo__layout">
          <HeaderGlobal />
          <SidebarGlobal />
          <main className="global-demo__main">
            <StepWizardGlobal />
            <SearchPanelGlobal />
            <div className="global-demo__user-section">
              <UserListGlobal />
              <UserDetailGlobal />
            </div>
          </main>
        </div>
      </AppStoreProvider>
    </section>
  )
}
