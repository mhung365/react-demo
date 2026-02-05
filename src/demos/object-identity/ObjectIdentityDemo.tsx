import { useState } from 'react'
import { InlineBreaksMemo } from './InlineBreaksMemo'
import { InlineBreaksEffect } from './InlineBreaksEffect'
import { InlineBreaksContext } from './InlineBreaksContext'
import { StableIdentities } from './StableIdentities'
import { StableIdentitiesEffect } from './StableIdentitiesEffect'
import { StabilizeNotWorthIt } from './StabilizeNotWorthIt'
import './object-identity-demo.css'

type Tab =
  | 'inline-memo'
  | 'inline-effect'
  | 'inline-context'
  | 'stable'
  | 'stable-effect'
  | 'not-worth-it'

/**
 * Demo: Problems caused by creating new objects/arrays on every render.
 *
 * 1. Inline objects/arrays break memoization (memo child always re-renders).
 * 2. Inline objects in useEffect deps trigger unnecessary effect re-runs.
 * 3. Inline Context value causes all consumers to re-render.
 * 4. Refactor: useMemo/useCallback/stable Context value.
 * 5. When stabilizing is NOT worth it (cheap child, no memo).
 */
export function ObjectIdentityDemo() {
  const [tab, setTab] = useState<Tab>('inline-memo')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'inline-memo', label: '1. Inline breaks memo' },
    { id: 'inline-effect', label: '2. Inline breaks effect' },
    { id: 'inline-context', label: '3. Inline breaks Context' },
    { id: 'stable', label: '4. Refactor: stable identities' },
    { id: 'stable-effect', label: '4b. Stable effect deps' },
    { id: 'not-worth-it', label: '5. When NOT to stabilize' },
  ]

  return (
    <main className="identity-demo">
      <header className="identity-demo__header">
        <h1>Object & array identity in React</h1>
        <p className="identity-demo__subtitle">
          New object/array on every render → new reference → breaks memo, triggers useEffect,
          re-renders Context consumers. Same content ≠ same reference.
        </p>
        <div className="identity-demo__tabs">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <section className="identity-demo__concepts">
        <h2>Why identity matters</h2>
        <ul>
          <li>
            <strong>React.memo:</strong> Shallow comparison (prevProps.x === nextProps.x). Inline{' '}
            <code>{`{ theme: 'dark' }`}</code> or <code>[1, 2, 3]</code> creates a new reference every
            render → memo never skips.
          </li>
          <li>
            <strong>useEffect deps:</strong> Compared with Object.is (reference equality). New
            object every render → effect runs every time.
          </li>
          <li>
            <strong>Context:</strong> Provider compares value by reference. New object every render
            → all consumers re-render.
          </li>
          <li>
            <strong>When to stabilize:</strong> useMemo/useCallback when the value is passed to a
            memoized child, in effect deps, or as Context value. When the consumer is not memoized
            or the callback is not in deps, stabilizing often adds cost without benefit.
          </li>
        </ul>
      </section>

      {tab === 'inline-memo' && <InlineBreaksMemo />}
      {tab === 'inline-effect' && <InlineBreaksEffect />}
      {tab === 'inline-context' && <InlineBreaksContext />}
      {tab === 'stable' && <StableIdentities />}
      {tab === 'stable-effect' && <StableIdentitiesEffect />}
      {tab === 'not-worth-it' && <StabilizeNotWorthIt />}
    </main>
  )
}
