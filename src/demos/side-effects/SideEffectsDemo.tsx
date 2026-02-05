import { useState } from 'react'
import { OveruseOfEffects } from './OveruseOfEffects'
import { LogicInWrongPlace } from './LogicInWrongPlace'
import { RefactoredFewerEffects } from './RefactoredFewerEffects'
import './side-effects-demo.css'

type Section = 'overuse' | 'wrong-place' | 'refactored'

/**
 * Demo: What is a side effect in React, and why are side effects often overused?
 *
 * - Definition: side effect = something that affects the outside world (API, DOM, subscription, analytics).
 * - Overuse: data fetch, derived state sync, analytics in useEffect when they belong in render / event handlers / React Query.
 * - Wrong placement: filtering in effect (should be render); analytics on "value changed" (should be event handler).
 * - Refactor: fewer effects; data in React Query; derived in render; analytics in handlers.
 */
export function SideEffectsDemo() {
  const [section, setSection] = useState<Section>('overuse')

  return (
    <main className="side-effects-demo">
      <header className="side-effects-demo__header">
        <h1>Side effects in React: definition and overuse</h1>
        <p className="side-effects-demo__subtitle">
          A <strong>side effect</strong> is code that affects something outside the component (API, DOM, subscription, analytics).
          React runs effects <em>after</em> commit. Often logic is wrongly placed in <code>useEffect</code> when it belongs in render or event handlers.
          Open the console to see <code>[render]</code> (sync) vs <code>[effect]</code> (async after commit).
        </p>
        <div className="side-effects-demo__tabs">
          <button
            type="button"
            className={section === 'overuse' ? 'active' : ''}
            onClick={() => setSection('overuse')}
          >
            Overuse (data + derived + analytics in effects)
          </button>
          <button
            type="button"
            className={section === 'wrong-place' ? 'active' : ''}
            onClick={() => setSection('wrong-place')}
          >
            Wrong place (filter + analytics in effects)
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (fewer effects)
          </button>
        </div>
      </header>

      <section className="side-effects-demo__concepts">
        <h2>What counts as a side effect</h2>
        <ul>
          <li><strong>Real side effects:</strong> data fetching (API), subscriptions (WebSocket, interval), DOM manipulation (focus, scroll), analytics/tracking, <code>document.title</code>.</li>
          <li><strong>Not side effects:</strong> computing derived data from props/state (filter list, format label) — do this during render. Responding to user events (click, submit) — do this in event handlers.</li>
          <li><strong>Why overused:</strong> habit from class lifecycle; treating &quot;when state changes&quot; as &quot;run effect&quot; instead of &quot;compute in render&quot; or &quot;run in handler&quot;.</li>
        </ul>
      </section>

      {section === 'overuse' && <OveruseOfEffects />}
      {section === 'wrong-place' && <LogicInWrongPlace />}
      {section === 'refactored' && <RefactoredFewerEffects />}
    </main>
  )
}
