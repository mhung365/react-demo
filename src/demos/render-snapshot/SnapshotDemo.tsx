import { useState } from 'react'
import { CounterBroken } from './CounterBroken'
import { CounterFixed } from './CounterFixed'
import './snapshot-demo.css'

/**
 * Demo: value equality vs reference equality, and how the render snapshot model
 * interacts with closures.
 *
 * - Each render = one snapshot of props and state.
 * - Callbacks created in that render close over that snapshot.
 * - Async code (setTimeout, promises, subscriptions) runs later; it still sees
 *   the snapshot from when the callback was created (stale closure).
 *
 * Open console to see [snapshot] and [broken]/[fixed] logs showing which render
 * each value came from.
 */
export function SnapshotDemo() {
  const [mode, setMode] = useState<'broken' | 'fixed'>('broken')

  return (
    <main className="snapshot-demo">
      <header className="snapshot-demo__header">
        <h1>Render snapshot &amp; closures</h1>
        <p className="snapshot-demo__subtitle">
          Each render creates a <strong>snapshot</strong> of props and state. Closures capture
          values from that snapshot — &quot;value looks correct&quot; in that render, but the
          <strong> reference can be stale</strong> when the callback runs later.
        </p>
        <div className="snapshot-demo__tabs">
          <button
            type="button"
            className={mode === 'broken' ? 'active' : ''}
            onClick={() => setMode('broken')}
          >
            Broken (stale closure)
          </button>
          <button
            type="button"
            className={mode === 'fixed' ? 'active' : ''}
            onClick={() => setMode('fixed')}
          >
            Fixed (functional update)
          </button>
        </div>
      </header>

      <section className="snapshot-demo__concepts">
        <h2>Concepts</h2>
        <ul>
          <li>
            <strong>Render snapshot</strong> — When the component function runs, it sees one
            immutable view of props and state. That is the &quot;snapshot&quot; for that render.
          </li>
          <li>
            <strong>Closure</strong> — A function (e.g. timeout callback, event handler) created
            during a render &quot;closes over&quot; the variables in scope. It keeps the values from
            that render, not the latest values.
          </li>
          <li>
            <strong>Value vs reference</strong> — The <em>value</em> (e.g. <code>count = 0</code>)
            was correct for that snapshot. The <em>reference</em> (the binding the closure holds)
            is stale when we intended to use the &quot;current&quot; value at execution time.
          </li>
          <li>
            <strong>Fix</strong> — Use functional updates <code>{`setState(prev => next)`}</code> so
            you don’t close over state, or ensure the callback runs in a context that has the latest
            values (e.g. ref for latest, or correct effect deps).
          </li>
        </ul>
      </section>

      {mode === 'broken' ? <CounterBroken /> : <CounterFixed />}
    </main>
  )
}
