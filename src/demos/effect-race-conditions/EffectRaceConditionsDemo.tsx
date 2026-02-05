import { useState } from 'react'
import { RaceCorrectDepsBroken } from './RaceCorrectDepsBroken'
import { FixAbortController } from './FixAbortController'
import { FixRequestIdGuard } from './FixRequestIdGuard'
import { FixIgnoreStale } from './FixIgnoreStale'
import './effect-race-conditions-demo.css'

type Section = 'broken' | 'abort' | 'request-id' | 'ignore'

/**
 * Demo: Race conditions inside useEffect even when dependencies look correct.
 *
 * - Broken: Correct deps [query], but rapid typing causes overlapping requests. Response order
 *   can differ from request order; last response to arrive overwrites state (often stale).
 * - Fix 1: AbortController — cancel previous request in cleanup. Only latest can complete.
 * - Fix 2: Request ID guard — only setState if myId === currentId when response arrives.
 * - Fix 3: Ignore stale (cancelled flag) — same outcome as request-id; no ID; request still runs.
 *
 * Console: [request] start #N / end #N so you see request order vs response order.
 */
export function EffectRaceConditionsDemo() {
  const [section, setSection] = useState<Section>('broken')

  return (
    <main className="race-demo">
      <header className="race-demo__header">
        <h1>Race conditions in useEffect (correct deps ≠ no race)</h1>
        <p className="race-demo__subtitle">
          <strong>Correct dependencies</strong> ensure we start the right request when query changes. They do <strong>not</strong> prevent overlapping requests or out-of-order responses. Whichever response arrives last overwrites state — often the older query. Mitigate with: <strong>AbortController</strong> (cancel request), <strong>request ID guard</strong>, or <strong>ignore stale</strong> (cancelled flag).
        </p>
        <div className="race-demo__tabs">
          <button
            type="button"
            className={section === 'broken' ? 'active' : ''}
            onClick={() => setSection('broken')}
          >
            Broken (correct deps, race)
          </button>
          <button
            type="button"
            className={section === 'abort' ? 'active' : ''}
            onClick={() => setSection('abort')}
          >
            Fix: AbortController
          </button>
          <button
            type="button"
            className={section === 'request-id' ? 'active' : ''}
            onClick={() => setSection('request-id')}
          >
            Fix: Request ID guard
          </button>
          <button
            type="button"
            className={section === 'ignore' ? 'active' : ''}
            onClick={() => setSection('ignore')}
          >
            Fix: Ignore stale
          </button>
        </div>
      </header>

      <section className="race-demo__concepts">
        <h2>Why correct deps don&apos;t prevent race</h2>
        <ul>
          <li><strong>Deps only control when the effect runs.</strong> When query changes, we start a new request. The previous request is still in flight; we don&apos;t cancel it or ignore its response.</li>
          <li><strong>Response order ≠ request order.</strong> Network/latency can cause an older request to finish after a newer one. Whichever .then runs last calls setState — can be stale data.</li>
          <li><strong>Mitigation:</strong> Cancel the previous request (AbortController), or ignore responses that are no longer current (request ID or cancelled flag).</li>
        </ul>
      </section>

      {section === 'broken' && <RaceCorrectDepsBroken />}
      {section === 'abort' && <FixAbortController />}
      {section === 'request-id' && <FixRequestIdGuard />}
      {section === 'ignore' && <FixIgnoreStale />}
    </main>
  )
}
