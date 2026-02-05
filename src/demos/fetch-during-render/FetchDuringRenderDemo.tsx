import { useState } from 'react'
import { FetchDuringRenderBroken } from './FetchDuringRenderBroken'
import { ConditionalFetchDuringRender } from './ConditionalFetchDuringRender'
import { FetchInEffectCorrect } from './FetchInEffectCorrect'
import './fetch-during-render-demo.css'

type Section = 'broken' | 'conditional' | 'correct'

/**
 * Demo: Why fetching data during render is wrong in React.
 *
 * - Broken: unconditional fetch in render → setState on resolve → re-render → fetch again → infinite loop.
 * - Conditional: fetch only when !data — no loop but still impure; Strict Mode can double-fetch.
 * - Correct: fetch in useEffect; render is pure (same props/state → same JSX, no side effects).
 *
 * Open console to see [render] count and "fetch during render" warnings.
 */
export function FetchDuringRenderDemo() {
  const [section, setSection] = useState<Section>('broken')

  return (
    <main className="fetch-during-render-demo">
      <header className="fetch-during-render-demo__header">
        <h1>Why fetching during render is wrong</h1>
        <p className="fetch-during-render-demo__subtitle">
          Render must be <strong>pure</strong>: same (props, state) → same JSX; no side effects (no fetch, no setState from async).
          Fetching during render breaks this: infinite loops, duplicate requests, and unpredictable order. Use <code>useEffect</code> (or React Query / Suspense) so fetch runs as a side effect <em>after</em> commit.
        </p>
        <div className="fetch-during-render-demo__tabs">
          <button
            type="button"
            className={section === 'broken' ? 'active' : ''}
            onClick={() => setSection('broken')}
          >
            Broken (infinite loop)
          </button>
          <button
            type="button"
            className={section === 'conditional' ? 'active' : ''}
            onClick={() => setSection('conditional')}
          >
            Conditional (still wrong)
          </button>
          <button
            type="button"
            className={section === 'correct' ? 'active' : ''}
            onClick={() => setSection('correct')}
          >
            Correct (useEffect)
          </button>
        </div>
      </header>

      <section className="fetch-during-render-demo__concepts">
        <h2>Pure render</h2>
        <ul>
          <li><strong>Pure:</strong> For the same props and state, the component returns the same JSX. No side effects: no fetch, no setState from async callbacks, no mutating globals or refs that trigger updates.</li>
          <li><strong>Why it matters:</strong> React may call your component multiple times (e.g. Strict Mode, concurrent features). If render starts a fetch or setState, you get duplicate requests or infinite loops.</li>
          <li><strong>Where to fetch:</strong> In <code>useEffect</code> (runs after commit) or via a library (React Query, Suspense) that schedules the fetch outside the render phase.</li>
        </ul>
      </section>

      {section === 'broken' && <FetchDuringRenderBroken />}
      {section === 'conditional' && <ConditionalFetchDuringRender />}
      {section === 'correct' && <FetchInEffectCorrect />}
    </main>
  )
}
