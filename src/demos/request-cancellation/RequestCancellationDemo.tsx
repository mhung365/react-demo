import { useState } from 'react'
import { NoCancellationBroken } from './NoCancellationBroken'
import { AbortControllerCorrect } from './AbortControllerCorrect'
import { IgnoreResponseVariant } from './IgnoreResponseVariant'
import './request-cancellation-demo.css'

type Section = 'broken' | 'abort' | 'ignore'

/**
 * Demo: Where and how request cancellation (abort) should be handled.
 *
 * - Broken: search-as-you-type with no cancellation → race (stale overwrites new), no cleanup → possible setState after unmount.
 * - Correct: AbortController in effect cleanup; pass signal to fetch; abort previous request when query changes or unmount.
 * - Alternative: Ignore outdated responses (cancelled flag) — same UX, but request still runs; no network cancellation.
 *
 * Console: [fetch] start/end with outcome (ok | aborted | error). Cleanup logs when abort/ignore runs.
 */
export function RequestCancellationDemo() {
  const [section, setSection] = useState<Section>('broken')

  return (
    <main className="request-cancel-demo">
      <header className="request-cancel-demo__header">
        <h1>Request cancellation in React</h1>
        <p className="request-cancel-demo__subtitle">
          <strong>Where:</strong> In the effect cleanup (when deps change or component unmounts). <strong>How:</strong> Create <code>AbortController</code>, pass <code>signal</code> to fetch, call <code>controller.abort()</code> in cleanup. Prevents race (stale overwriting new) and setState-after-unmount (memory leak). Contrast: <strong>ignore response</strong> (cancelled flag) vs <strong>abort request</strong> (AbortController).
        </p>
        <div className="request-cancel-demo__tabs">
          <button
            type="button"
            className={section === 'broken' ? 'active' : ''}
            onClick={() => setSection('broken')}
          >
            Broken (no cancel)
          </button>
          <button
            type="button"
            className={section === 'abort' ? 'active' : ''}
            onClick={() => setSection('abort')}
          >
            AbortController (correct)
          </button>
          <button
            type="button"
            className={section === 'ignore' ? 'active' : ''}
            onClick={() => setSection('ignore')}
          >
            Ignore response (variant)
          </button>
        </div>
      </header>

      <section className="request-cancel-demo__concepts">
        <h2>Cleanup and memory leaks</h2>
        <ul>
          <li><strong>Without cleanup:</strong> When the user changes query (or navigates away), the previous request&apos;s .then/.catch can still run and call setState. That causes stale data overwriting new data (race) or &quot;Can&apos;t perform a React state update on an unmounted component&quot; (memory leak warning).</li>
          <li><strong>With cleanup:</strong> Either abort the request (AbortController) or ignore the response (cancelled flag). In both cases, don&apos;t setState when the effect has been &quot;replaced&quot; or the component has unmounted.</li>
          <li><strong>Abort vs ignore:</strong> AbortController cancels the in-flight request (fetch throws, server may stop work). Ignore only discards the result when it arrives; the request still completes.</li>
        </ul>
      </section>

      {section === 'broken' && <NoCancellationBroken />}
      {section === 'abort' && <AbortControllerCorrect />}
      {section === 'ignore' && <IgnoreResponseVariant />}
    </main>
  )
}
