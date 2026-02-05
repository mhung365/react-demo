import { useState } from 'react'
import { WrongImplementation } from './WrongImplementation'
import { RefactoredCorrect } from './RefactoredCorrect'
import './state-classification-demo.css'

type TabId = 'wrong' | 'refactored'

/**
 * Demo shell: UI state vs client state vs server state.
 * - Wrong: server data in useState/useEffect; mixed ownership; no cache.
 * - Refactored: React Query for server state; useState for UI; narrow Context for client (preferences).
 */
export function StateClassificationDemo() {
  const [tab, setTab] = useState<TabId>('wrong')

  return (
    <main className="state-class-demo">
      <header className="state-class-demo__header">
        <h1>State classification: UI, client, server</h1>
        <p className="state-class-demo__subtitle">
          <strong>UI state</strong> (modal, tabs, form input) is ephemeral and local. <strong>Client state</strong> (preferences, cross-feature) lives in narrow context or localStorage. <strong>Server state</strong> (API data) belongs in a cache layer (e.g. React Query), not in <code>useState</code> or global store. Misclassifying server data as client state causes redundant fetches, no cache, and manual loading/error/invalidation.
        </p>
        <div className="state-class-demo__tabs">
          <button
            type="button"
            className={tab === 'wrong' ? 'active' : ''}
            onClick={() => setTab('wrong')}
          >
            Wrong: server as client state
          </button>
          <button
            type="button"
            className={tab === 'refactored' ? 'active' : ''}
            onClick={() => setTab('refactored')}
          >
            Refactored: correct classification
          </button>
        </div>
      </header>
      {tab === 'wrong' && <WrongImplementation />}
      {tab === 'refactored' && <RefactoredCorrect />}
    </main>
  )
}
