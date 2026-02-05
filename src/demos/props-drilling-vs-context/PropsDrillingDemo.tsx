import { useState } from 'react'
import { PropsDrillingVersion } from './PropsDrillingVersion'
import { ContextVersion } from './ContextVersion'
import './props-drilling-demo.css'

type Section = 'props' | 'context'

/**
 * Demo: When is props drilling actually a GOOD choice?
 *
 * - Props drilling: formData and setField passed explicitly through 4 levels. Simple, clear, traceable. No Provider, no useContext.
 * - Context: Same form with FormContext. Every component uses useContext — you don't see what they receive in the signature; you have to find the Provider. Unnecessary complexity for this depth.
 * - Avoiding props drilling too early is a mistake: you add Context (or Redux) before the tree is deep or the prop list is painful, and you lose readability and traceability without real benefit.
 */
export function PropsDrillingDemo() {
  const [section, setSection] = useState<Section>('props')

  return (
    <main className="props-drilling-demo">
      <header className="props-drilling-demo__header">
        <h1>Props drilling vs Context</h1>
        <p className="props-drilling-demo__subtitle">
          For a small-to-medium tree (4 levels), <strong>props drilling is often the better choice</strong>: explicit data flow, easy to trace, no Provider/useContext. Context adds indirection — &quot;where does this come from?&quot; — without benefit at this depth. Avoid props drilling too early (e.g. Context &quot;from day one&quot;) and you lose readability and traceability. Open the console to see <code>[render]</code> logs; compare mental overhead and debugging experience.
        </p>
        <div className="props-drilling-demo__tabs">
          <button
            type="button"
            className={section === 'props' ? 'active' : ''}
            onClick={() => setSection('props')}
          >
            Props drilling (simple, clear)
          </button>
          <button
            type="button"
            className={section === 'context' ? 'active' : ''}
            onClick={() => setSection('context')}
          >
            Context (unnecessary complexity)
          </button>
        </div>
      </header>

      <section className="props-drilling-demo__concepts">
        <h2>When props drilling is a good choice</h2>
        <ul>
          <li>
            <strong>Readability:</strong> Each component&apos;s props show exactly what it receives. formData, setField — no guessing. With Context, you see useContext(FormContext); you have to open the Provider to know the shape.
          </li>
          <li>
            <strong>Traceability:</strong> To find where formData is set, follow the tree: Dashboard → FormLayout → FormSection → FieldGroup. One path. With Context, search for FormProvider and for every useContext(FormContext).
          </li>
          <li>
            <strong>Re-renders:</strong> At this depth, both approaches re-render the path when state changes. Context doesn&apos;t reduce re-renders here; it just hides the flow.
          </li>
          <li>
            <strong>When props drilling stops being acceptable:</strong> Many levels (e.g. 7+), or many unrelated branches that need the same data. Then Context (or composition) can reduce boilerplate — but you pay with implicit flow and harder debugging.
          </li>
        </ul>
      </section>

      {section === 'props' && <PropsDrillingVersion />}
      {section === 'context' && <ContextVersion />}
    </main>
  )
}
