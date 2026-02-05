import { useState } from 'react'
import { ParentAllUnstable } from './ParentAllUnstable'
import { ParentSingleChanging } from './ParentSingleChanging'
import { ParentRefactorSplit } from './ParentRefactorSplit'
import './memo-props-change-demo.css'

type Section = 'all-unstable' | 'single-changing' | 'refactor-split'

/**
 * Demo: What happens when a component is memoized but its props still change?
 *
 * - React.memo compares props with shallow comparison: Object.is(prevProp, nextProp) for each key.
 * - Props can change by reference (new object/function) but not by value — memo still re-renders (ref wins).
 * - A single changing prop invalidates memoization: all props must be ref-equal for memo to skip.
 * - Prop shape and responsibility: passing one big object or mixing stable + changing props makes memo fragile.
 * - Refactor: split props so the memoized child receives only stable props (or move changing data to parent/sibling).
 */
export function MemoPropsChangeDemo() {
  const [section, setSection] = useState<Section>('all-unstable')

  return (
    <main className="memo-props-demo">
      <header className="memo-props-demo__header">
        <h1>Memoized component with changing props</h1>
        <p className="memo-props-demo__subtitle">
          React.memo uses <strong>shallow comparison</strong>: for each prop, <code>Object.is(prevProp, nextProp)</code>.
          One prop that changes (by reference or value) invalidates memo — the whole component re-renders. Console logs
          show <strong>which prop(s) broke memo</strong>. Refactor: split props so the memoized child gets only stable
          props.
        </p>
        <div className="memo-props-demo__tabs">
          <button
            type="button"
            className={section === 'all-unstable' ? 'active' : ''}
            onClick={() => setSection('all-unstable')}
          >
            All props unstable
          </button>
          <button
            type="button"
            className={section === 'single-changing' ? 'active' : ''}
            onClick={() => setSection('single-changing')}
          >
            Single prop changes
          </button>
          <button
            type="button"
            className={section === 'refactor-split' ? 'active' : ''}
            onClick={() => setSection('refactor-split')}
          >
            Refactor: split props
          </button>
        </div>
      </header>

      <section className="memo-props-demo__concepts">
        <h2>Shallow comparison and prop shape</h2>
        <ul>
          <li>
            <strong>Shallow comparison:</strong> React.memo does not deep-compare. For each prop key, it checks{' '}
            <code>Object.is(prevProp, nextProp)</code>. Primitives: same value → skip. Objects/functions: same
            reference → skip; new reference → re-render (even if &quot;value&quot; is the same).
          </li>
          <li>
            <strong>Single changing prop:</strong> If <em>any</em> prop fails the check, the component re-renders.
            Four stable props and one changing prop → memo fails. Prop shape: mixing stable and changing props in one
            component makes memo fragile.
          </li>
          <li>
            <strong>Refactor:</strong> Split responsibility so the memoized child receives only stable props. Move the
            changing data to the parent (or a sibling) so it is not passed into the memoized component. Then memo can
            skip when the parent re-renders for that changing data.
          </li>
        </ul>
      </section>

      {section === 'all-unstable' && <ParentAllUnstable />}
      {section === 'single-changing' && <ParentSingleChanging />}
      {section === 'refactor-split' && <ParentRefactorSplit />}
    </main>
  )
}
