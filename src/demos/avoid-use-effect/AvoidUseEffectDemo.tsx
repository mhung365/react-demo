import { useState } from 'react'
import { SyncStateFromPropsEffect } from './SyncStateFromPropsEffect'
import { DeriveOrControlled } from './DeriveOrControlled'
import { EventReactionInEffect } from './EventReactionInEffect'
import { EventHandlerInstead } from './EventHandlerInstead'
import { DataFetchInEffect } from './DataFetchInEffect'
import { ReactQueryInstead } from './ReactQueryInstead'
import { UnavoidableEffect } from './UnavoidableEffect'
import './avoid-use-effect-demo.css'

type Section =
  | 'sync-state'
  | 'event-reaction'
  | 'data-fetch'
  | 'unavoidable'

/**
 * Demo: When should useEffect be avoided, and what patterns to use instead?
 *
 * - Sync state from props → derive during render or controlled with key.
 * - Reacting to user action → event handler instead of effect.
 * - Data fetching → React Query (or other data layer), not useEffect + useState.
 * - Unavoidable: imperative DOM (focus), subscriptions (resize, WebSocket), external store sync.
 */
export function AvoidUseEffectDemo() {
  const [section, setSection] = useState<Section>('sync-state')
  const [userId, setUserId] = useState('user-1')

  return (
    <main className="avoid-use-effect-demo">
      <header className="avoid-use-effect-demo__header">
        <h1>When to avoid useEffect and what to use instead</h1>
        <p className="avoid-use-effect-demo__subtitle">
          Many cases that use <code>useEffect</code> are better handled by <strong>deriving during render</strong>, <strong>event handlers</strong>, <strong>controlled components (key)</strong>, or a <strong>data layer (e.g. React Query)</strong>. Use effect only when you must sync with something outside React (DOM, subscriptions, external store).
        </p>
        <div className="avoid-use-effect-demo__tabs">
          <button
            type="button"
            className={section === 'sync-state' ? 'active' : ''}
            onClick={() => setSection('sync-state')}
          >
            1. Sync state from props
          </button>
          <button
            type="button"
            className={section === 'event-reaction' ? 'active' : ''}
            onClick={() => setSection('event-reaction')}
          >
            2. Event reaction
          </button>
          <button
            type="button"
            className={section === 'data-fetch' ? 'active' : ''}
            onClick={() => setSection('data-fetch')}
          >
            3. Data fetch
          </button>
          <button
            type="button"
            className={section === 'unavoidable' ? 'active' : ''}
            onClick={() => setSection('unavoidable')}
          >
            4. Unavoidable effect
          </button>
        </div>
      </header>

      <section className="avoid-use-effect-demo__concepts">
        <h2>Patterns at a glance</h2>
        <ul>
          <li><strong>Derive during render:</strong> Prop/source of truth → display value. No state, no effect. Same input → same output.</li>
          <li><strong>Event handler:</strong> User did X → do Y in the same handler (setState + side effect). Don’t put Y in an effect that runs “when state from X changes.”</li>
          <li><strong>Controlled with key:</strong> Need local state that resets when “which item” changes? Use <code>key=&#123;id&#125;</code> so React remounts the child with fresh state. No “sync state from props” effect.</li>
          <li><strong>React Query (or similar):</strong> Server state (API data) → data layer. No manual useEffect fetch, loading, error, or cache.</li>
          <li><strong>Unavoidable effect:</strong> Imperative DOM (focus, scroll), subscriptions (resize, WebSocket), or syncing to an external store. These are real side effects; use effect and cleanup.</li>
        </ul>
      </section>

      {section === 'sync-state' && (
        <>
          <div className="avoid-use-effect-demo__header" style={{ marginTop: '1rem' }}>
            <p className="avoid-use-effect-demo__subtitle">
              Parent controls <code>userId</code>. Change it to see before (effect sync) vs after (derive).
            </p>
            <div className="avoid-section__controls">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>UserId:</span>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                >
                  <option value="user-1">user-1</option>
                  <option value="user-2">user-2</option>
                  <option value="user-3">user-3</option>
                </select>
              </label>
            </div>
          </div>
          <SyncStateFromPropsEffect userId={userId} />
          <DeriveOrControlled userId={userId} />
        </>
      )}

      {section === 'event-reaction' && (
        <>
          <EventReactionInEffect />
          <EventHandlerInstead />
        </>
      )}

      {section === 'data-fetch' && (
        <>
          <DataFetchInEffect />
          <ReactQueryInstead />
        </>
      )}

      {section === 'unavoidable' && <UnavoidableEffect />}
    </main>
  )
}
