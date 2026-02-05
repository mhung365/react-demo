import { useState } from 'react'
import { MemoWorks } from './MemoWorks'
import { MemoFailsPropsRef } from './MemoFailsPropsRef'
import { MemoFailsContext } from './MemoFailsContext'
import { MemoFailsChildren } from './MemoFailsChildren'
import './react-memo-demo.css'

type Section = 'works' | 'fails-props' | 'fails-context' | 'fails-children'

/**
 * Demo: What does React.memo actually prevent, and what does it NOT prevent?
 *
 * - React.memo uses SHALLOW comparison: for each prop, Object.is(prevProp, nextProp).
 *   Same reference (object/function) → skip re-render; new reference → re-render.
 * - Memo WORKS: parent passes stable refs (useMemo/useCallback) → memo skips.
 * - Memo FAILS (props ref): parent passes inline {} or () => {} → new ref every render → memo cannot skip.
 * - Memo FAILS (Context): child consumes Context; when context value changes, React re-renders consumers —
 *   memo does NOT prevent that (re-render is triggered by subscription, not by "parent passed new props").
 * - Memo FAILS (children): parent passes inline JSX as children → new element every render → children prop
 *   is new ref → memo cannot skip.
 */
export function MemoDemo() {
  const [section, setSection] = useState<Section>('works')

  return (
    <main className="memo-demo">
      <header className="memo-demo__header">
        <h1>What React.memo prevents (and does not)</h1>
        <p className="memo-demo__subtitle">
          React.memo does <strong>shallow comparison</strong> of props: same reference → skip re-render; new
          reference → re-render. It does <strong>not</strong> prevent re-renders triggered by Context updates,
          state inside the component, or when any prop (including <code>children</code>) gets a new reference.
          Open the console to see render logs and why memo succeeds or fails.
        </p>
        <div className="memo-demo__tabs">
          <button
            type="button"
            className={section === 'works' ? 'active' : ''}
            onClick={() => setSection('works')}
          >
            Memo works
          </button>
          <button
            type="button"
            className={section === 'fails-props' ? 'active' : ''}
            onClick={() => setSection('fails-props')}
          >
            Memo fails: props ref
          </button>
          <button
            type="button"
            className={section === 'fails-context' ? 'active' : ''}
            onClick={() => setSection('fails-context')}
          >
            Memo fails: Context
          </button>
          <button
            type="button"
            className={section === 'fails-children' ? 'active' : ''}
            onClick={() => setSection('fails-children')}
          >
            Memo fails: children
          </button>
        </div>
      </header>

      <section className="memo-demo__concepts">
        <h2>How React.memo works internally</h2>
        <ul>
          <li>
            <strong>Shallow comparison:</strong> For each prop, React checks <code>Object.is(prevProp, nextProp)</code>.
            Primitives: same value → skip. Objects/functions: <strong>same reference</strong> → skip; new reference →
            re-render.
          </li>
          <li>
            <strong>Memo prevents:</strong> Re-renders caused by &quot;parent re-rendered and passed the same props
            (referentially)&quot;. If all props are === to previous, the component body does not run again.
          </li>
          <li>
            <strong>Memo does NOT prevent:</strong> Re-renders caused by (1) parent passing new refs (inline{' '}
            <code>{`{}`}</code> or <code>{`() => {}`}</code>), (2) Context value changing (consumers re-render),
            (3) state updates inside the component, (4) <code>children</code> prop being new JSX every render.
          </li>
        </ul>
      </section>

      {section === 'works' && <MemoWorks />}
      {section === 'fails-props' && <MemoFailsPropsRef />}
      {section === 'fails-context' && <MemoFailsContext />}
      {section === 'fails-children' && <MemoFailsChildren />}
    </main>
  )
}
