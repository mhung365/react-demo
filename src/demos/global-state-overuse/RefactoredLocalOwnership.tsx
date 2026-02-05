import { useState, useMemo, memo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_USERS, type User, type WorkflowStep } from './types'
import './global-state-demo.css'

/**
 * REFACTORED: State owned locally or at feature level.
 *
 * - sidebarOpen: Layout (only Layout + Sidebar re-render on toggle).
 * - currentStep: StepWizard (only StepWizard re-renders).
 * - searchQuery: SearchSection (SearchSection, SearchPanel, UserSection, UserList re-render; UserDetail is memo so it skips when only search changes).
 * - selectedUserId: UserSection (UserSection, UserList, UserDetail re-render when selection changes).
 *
 * Typing in search → 4 components re-render (not Header, Sidebar, StepWizard, UserDetail). Toggle sidebar → 2 components. Clear ownership, smaller blast radius.
 */

function LayoutLocal({
  sidebarOpen,
  setSidebarOpen,
  children,
}: {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  children: React.ReactNode
}) {
  useRenderLog('Layout (local state)', { sidebarOpen })
  return (
    <div className="global-demo__layout">
      <header className="global-demo__header">
        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? 'Hide' : 'Show'} sidebar
        </button>
        <span>Dashboard (local ownership)</span>
      </header>
      {sidebarOpen && (
        <aside className="global-demo__sidebar">
          <p>Sidebar (re-renders only when sidebar toggles)</p>
        </aside>
      )}
      <main className="global-demo__main">
        {children}
      </main>
    </div>
  )
}

function StepWizardLocal() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1)
  useRenderLog('StepWizard (local state)', { currentStep })

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
      <p className="global-demo__hint">Re-renders only when step changes.</p>
    </div>
  )
}

function SearchPanelLocal({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string
  setSearchQuery: (v: string) => void
}) {
  useRenderLog('SearchPanel (local ownership)', { searchQuery: searchQuery.slice(0, 20) })

  return (
    <div className="global-demo__search">
      <label>
        Search: <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type — only search + list re-render"
        />
      </label>
    </div>
  )
}

function UserListLocal({
  searchQuery,
  selectedUserId,
  onSelect,
}: {
  searchQuery: string
  selectedUserId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('UserList (feature-level props)', { selectedUserId })

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
            onClick={() => onSelect(u.id)}
          >
            {u.name} — {u.role}
          </li>
        ))}
      </ul>
    </div>
  )
}

const UserDetailLocal = memo(function UserDetailLocal({
  user,
}: {
  user: User | null
}) {
  useRenderLog('UserDetail (memo, local ownership)', { userId: user?.id })

  return (
    <div className="global-demo__user-detail">
      {user ? (
        <p><strong>{user.name}</strong> — {user.role}</p>
      ) : (
        <p>Select a user</p>
      )}
      <p className="global-demo__hint global-demo__hint--correct">
        Memoized: re-renders only when selected user changes. Typing in search does not re-render this panel.
      </p>
    </div>
  )
})

function SearchSectionWithUserList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  useRenderLog('SearchSection (owns search + selection for this block)', { searchQuery: searchQuery.slice(0, 20), selectedUserId })

  const filtered = useMemo(
    () =>
      MOCK_USERS.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  )

  const selectedUser = useMemo(
    () => MOCK_USERS.find((u) => u.id === selectedUserId) ?? null,
    [selectedUserId]
  )

  return (
    <>
      <SearchPanelLocal searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="global-demo__user-section">
        <UserListLocal
          searchQuery={searchQuery}
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />
        <UserDetailLocal user={selectedUser} />
      </div>
    </>
  )
}

export function RefactoredLocalOwnership() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  useRenderLog('Dashboard (refactored)', {})

  return (
    <section className="global-demo global-demo--correct">
      <header className="global-demo__section-header">
        <h2>Refactored: local / feature-level ownership</h2>
        <p>
          State is colocated or at minimal ancestor: <strong>sidebarOpen</strong> in Layout, <strong>currentStep</strong> in StepWizard, <strong>searchQuery + selectedUserId</strong> in SearchSection (one block). Typing in search re-renders only SearchSection, SearchPanel, UserList (and UserDetail only when selection changes, thanks to memo). Toggle sidebar → only Layout + Sidebar. Smaller blast radius, clear ownership.
        </p>
      </header>
      <LayoutLocal sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <StepWizardLocal />
        <SearchSectionWithUserList />
      </LayoutLocal>
    </section>
  )
}
