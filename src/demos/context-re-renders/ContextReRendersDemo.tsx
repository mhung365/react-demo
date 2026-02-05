import { useState } from 'react'
import { UnstableProviderValue } from './UnstableProviderValue'
import { MemoizedConsumersNoHelp } from './MemoizedConsumersNoHelp'
import { RefactoredBlastRadius } from './RefactoredBlastRadius'
import './context-re-renders-demo.css'

type Section = 'unstable' | 'memo-no-help' | 'refactored'

/**
 * Demo: Why does React Context often cause re-renders across large parts of the tree?
 *
 * - Context propagation: When a Provider's value changes (by reference, Object.is), React re-renders ALL consumers of that context. Not "only the ones that read the changed slice" — all of them.
 * - Unstable value: value = new object every render → every consumer re-renders on every Provider re-render.
 * - Object identity: React compares context value by reference. useMemo for value so identity is stable when deps haven't changed.
 * - Memoizing consumers does NOT help: memo skips re-render when PROPS are equal. Context-triggered re-renders are caused by the context VALUE changing; the consumer re-renders because it uses useContext and the value identity changed. memo is irrelevant.
 * - Refactor: Split contexts (CountContext, ThemeContext) so only consumers of the changed context re-render.
 */
export function ContextReRendersDemo() {
  const [section, setSection] = useState<Section>('unstable')

  return (
    <main className="context-re-renders-demo">
      <header className="context-re-renders-demo__header">
        <h1>Context and re-renders</h1>
        <p className="context-re-renders-demo__subtitle">
          When a Provider&apos;s <strong>value</strong> changes (by reference, <code>Object.is</code>), React re-renders <strong>all</strong> consumers of that context. Unstable value (new object every render) → all consumers re-render every time. <strong>Memoizing consumers does not prevent</strong> Context-triggered re-renders — memo only compares props. Refactor: split contexts or memoize Provider value to reduce blast radius. Open the console to see <code>[render]</code> logs.
        </p>
        <div className="context-re-renders-demo__tabs">
          <button
            type="button"
            className={section === 'unstable' ? 'active' : ''}
            onClick={() => setSection('unstable')}
          >
            Unstable value
          </button>
          <button
            type="button"
            className={section === 'memo-no-help' ? 'active' : ''}
            onClick={() => setSection('memo-no-help')}
          >
            Memo no help
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (split)
          </button>
        </div>
      </header>

      <section className="context-re-renders-demo__concepts">
        <h2>How Context propagation works internally</h2>
        <ul>
          <li>
            <strong>Provider value change:</strong> When the component that renders <code>{'<Context.Provider value={...}>'}</code> re-renders and passes a <strong>new value reference</strong> (Object.is(oldValue, newValue) === false), React marks all consumers of that context for re-render. Every component that called useContext(Context) will re-render — regardless of whether they &quot;use&quot; the part that changed.
          </li>
          <li>
            <strong>Object identity:</strong> React does not deep-compare the value. It uses <code>Object.is(prevValue, nextValue)</code>. So <code>{'value={{ count, theme }}'}</code> without useMemo creates a new object every render → all consumers re-render every time the Provider re-renders.
          </li>
          <li>
            <strong>Memoizing consumers does NOT help:</strong> memo(Component) skips re-render when the component&apos;s <strong>props</strong> are referentially equal. But Context-triggered re-renders are not caused by props — they are caused by the context value (from the nearest Provider) having changed. So when the context value identity changes, React re-renders the consumer; memo does not block that.
          </li>
          <li>
            <strong>Refactor:</strong> Split contexts (CountContext, ThemeContext) so only consumers of the changed context re-render. Memoize Provider value (useMemo) so value identity is stable when dependencies haven&apos;t changed.
          </li>
        </ul>
      </section>

      {section === 'unstable' && <UnstableProviderValue />}
      {section === 'memo-no-help' && <MemoizedConsumersNoHelp />}
      {section === 'refactored' && <RefactoredBlastRadius />}
    </main>
  )
}
