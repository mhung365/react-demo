import { useState } from 'react'
import { StrictModeDoubleEffect } from './StrictModeDoubleEffect'
import { UnstableDepsDoubleFetch } from './UnstableDepsDoubleFetch'
import { FixedUnstableDeps } from './FixedUnstableDeps'
import { RaceConditionOverlapping } from './RaceConditionOverlapping'
import './double-fetch-demo.css'

type Section = 'strict' | 'unstable' | 'fixed' | 'race'

/**
 * Demo: When and why double fetching happens in React.
 *
 * - StrictMode: React intentionally double-invokes effects in dev → two fetch starts. Dev-only; fix is cleanup (cancelled), not disabling StrictMode.
 * - Unstable deps: Effect depends on object literal → new reference every render → effect runs every render → real double/multiple fetch bug (production too).
 * - Fixed: Primitive deps [status, search] + cancellation → one fetch per filter change.
 * - Race: Overlapping fetches without cancellation → older response can overwrite newer.
 */
export function DoubleFetchDemo() {
  const [section, setSection] = useState<Section>('strict')

  return (
    <main className="double-fetch-demo">
      <header className="double-fetch-demo__header">
        <h1>When and why double fetching happens</h1>
        <p className="double-fetch-demo__subtitle">
          <strong>StrictMode (dev):</strong> React runs effect → cleanup → effect again on mount. Two fetch starts; use cleanup so the first run&apos;s result is ignored. <strong>Unstable deps:</strong> Object in deps = new ref every render = effect every render = real bug. <strong>Fix:</strong> Primitive deps + cancellation. Disabling StrictMode is the wrong solution — it hides bugs.
        </p>
        <div className="double-fetch-demo__tabs">
          <button
            type="button"
            className={section === 'strict' ? 'active' : ''}
            onClick={() => setSection('strict')}
          >
            StrictMode double effect
          </button>
          <button
            type="button"
            className={section === 'unstable' ? 'active' : ''}
            onClick={() => setSection('unstable')}
          >
            Unstable deps (bug)
          </button>
          <button
            type="button"
            className={section === 'fixed' ? 'active' : ''}
            onClick={() => setSection('fixed')}
          >
            Fixed (primitives + cancel)
          </button>
          <button
            type="button"
            className={section === 'race' ? 'active' : ''}
            onClick={() => setSection('race')}
          >
            Race (overlapping)
          </button>
        </div>
      </header>

      <section className="double-fetch-demo__concepts">
        <h2>Dev vs production</h2>
        <ul>
          <li><strong>StrictMode double effect:</strong> Dev-only. React runs effects twice on mount to surface missing cleanups. In production build, effects run once per mount.</li>
          <li><strong>Unstable deps:</strong> Real bug in production. If your effect depends on an object/array created in render, it runs every render → duplicate or excessive fetches.</li>
          <li><strong>Wrong &quot;fix&quot;:</strong> Disabling StrictMode hides the double run but doesn&apos;t fix incorrect dependencies or missing cleanup. Design fetch logic with cleanup and stable deps.</li>
        </ul>
      </section>

      {section === 'strict' && <StrictModeDoubleEffect />}
      {section === 'unstable' && <UnstableDepsDoubleFetch />}
      {section === 'fixed' && <FixedUnstableDeps />}
      {section === 'race' && <RaceConditionOverlapping />}
    </main>
  )
}
