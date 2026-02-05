import { useState } from 'react'
import { GlobalByConvenience } from './GlobalByConvenience'
import { RefactoredLocalOwnership } from './RefactoredLocalOwnership'
import { GlobalByNecessity } from './GlobalByNecessity'
import './global-state-demo.css'

type Section = 'convenience' | 'refactored' | 'necessity'

/**
 * Demo: Why is global state often overused in React?
 *
 * - Global by convenience: All UI state (sidebar, step, search, selection) in one Context. Any update re-renders every consumer. Coupling and blast radius maximized.
 * - Refactored: State at local or feature level. Smaller re-render scope, clear ownership.
 * - Global by necessity: Only theme (truly app-wide, few consumers) in Context. Toggle theme → only Header and ThemeToggle re-render.
 */
export function GlobalStateDemo() {
  const [section, setSection] = useState<Section>('convenience')

  return (
    <main className="global-state-demo">
      <header className="global-state-demo__header">
        <h1>Global state overuse</h1>
        <p className="global-state-demo__subtitle">
          Putting UI state (sidebar, step, search, selection) in Context or Redux &quot;because it&apos;s easier&quot; increases coupling and re-render scope. Every consumer re-renders when any slice changes. Refactor: own state locally or at feature level. Use global state only when truly app-wide (e.g. theme, current user) with few or coarse-grained consumers. Open the console to see <code>[render]</code> logs.
        </p>
        <div className="global-state-demo__tabs">
          <button
            type="button"
            className={section === 'convenience' ? 'active' : ''}
            onClick={() => setSection('convenience')}
          >
            Global by convenience
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (local ownership)
          </button>
          <button
            type="button"
            className={section === 'necessity' ? 'active' : ''}
            onClick={() => setSection('necessity')}
          >
            Global by necessity
          </button>
        </div>
      </header>

      <section className="global-state-demo__concepts">
        <h2>Global vs local ownership</h2>
        <ul>
          <li>
            <strong>Global by convenience:</strong> One Context (or Redux) holds sidebar, step, search, selection. Every component that reads any of these re-renders when any value changes. Typing in search re-renders Header, Sidebar, StepWizard, UserDetail — unnecessary. High coupling.
          </li>
          <li>
            <strong>Refactored:</strong> State colocated or at minimal ancestor. Sidebar state in Layout; step in StepWizard; search + selection in one block (SearchSection). Typing re-renders only that block; UserDetail memoized so it skips when only search changed. Smaller blast radius.
          </li>
          <li>
            <strong>Global by necessity:</strong> Only state that is truly app-wide (theme, current user) and has few consumers or coarse updates. ThemeProvider wraps only Header + ThemeToggle; UnrelatedPanel is outside the provider and does not re-render when theme toggles.
          </li>
        </ul>
      </section>

      {section === 'convenience' && <GlobalByConvenience />}
      {section === 'refactored' && <RefactoredLocalOwnership />}
      {section === 'necessity' && <GlobalByNecessity />}
    </main>
  )
}
