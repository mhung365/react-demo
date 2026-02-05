import { useState } from 'react'
import { ColocatedTooLow } from './ColocatedTooLow'
import { LiftedTooHigh } from './LiftedTooHigh'
import { BalancedState } from './BalancedState'
import { LiftedTooHighDeep } from './LiftedTooHighDeep'
import { MemoBandAid } from './MemoBandAid'
import { RefactoredCorrectly } from './RefactoredCorrectly'
import './state-placement-demo.css'

type MainSection = 'basics' | 'anti-pattern'
type BasicsSection = 'colocated' | 'lifted' | 'balanced'
type AntiPatternSection = 'lifted-deep' | 'memo-band-aid' | 'refactored'

/**
 * Demo: When should state be colocated, and when should it be lifted?
 * When does lifting state up become an anti-pattern?
 *
 * Basics: Colocated too low | Lifted too high | Balanced.
 * Lifting anti-pattern: Lifted (deep + drilling) | Memo band-aid | Refactored (state at minimal ancestor).
 */
export function StatePlacementDemo() {
  const [mainSection, setMainSection] = useState<MainSection>('basics')
  const [basicsSection, setBasicsSection] = useState<BasicsSection>('colocated')
  const [antiPatternSection, setAntiPatternSection] = useState<AntiPatternSection>('lifted-deep')

  return (
    <main className="placement-demo">
      <header className="placement-demo__header">
        <h1>State colocation vs lifting up</h1>
        <p className="placement-demo__subtitle">
          Colocate when only one component needs the state; lift to the <strong>minimal common ancestor</strong> when multiple components must share it. Lifting too high causes wide re-renders and prop drilling; memo is often a band-aid. Open the console to see <code>[render]</code> logs.
        </p>
        <div className="placement-demo__tabs">
          <button
            type="button"
            className={mainSection === 'basics' ? 'active' : ''}
            onClick={() => setMainSection('basics')}
          >
            Basics
          </button>
          <button
            type="button"
            className={mainSection === 'anti-pattern' ? 'active' : ''}
            onClick={() => setMainSection('anti-pattern')}
          >
            Lifting anti-pattern
          </button>
        </div>

        {mainSection === 'basics' && (
          <div className="placement-demo__sub-tabs">
            <button
              type="button"
              className={basicsSection === 'colocated' ? 'active' : ''}
              onClick={() => setBasicsSection('colocated')}
            >
              Colocated too low
            </button>
            <button
              type="button"
              className={basicsSection === 'lifted' ? 'active' : ''}
              onClick={() => setBasicsSection('lifted')}
            >
              Lifted too high
            </button>
            <button
              type="button"
              className={basicsSection === 'balanced' ? 'active' : ''}
              onClick={() => setBasicsSection('balanced')}
            >
              Balanced
            </button>
          </div>
        )}

        {mainSection === 'anti-pattern' && (
          <div className="placement-demo__sub-tabs">
            <button
              type="button"
              className={antiPatternSection === 'lifted-deep' ? 'active' : ''}
              onClick={() => setAntiPatternSection('lifted-deep')}
            >
              Lifted deep (drilling)
            </button>
            <button
              type="button"
              className={antiPatternSection === 'memo-band-aid' ? 'active' : ''}
              onClick={() => setAntiPatternSection('memo-band-aid')}
            >
              Memo band-aid
            </button>
            <button
              type="button"
              className={antiPatternSection === 'refactored' ? 'active' : ''}
              onClick={() => setAntiPatternSection('refactored')}
            >
              Refactored (placed correctly)
            </button>
          </div>
        )}
      </header>

      {mainSection === 'basics' && (
        <section className="placement-demo__concepts">
          <h2>State placement rules</h2>
          <ul>
            <li>
              <strong>Colocate</strong> when only one component needs the state. Keeps re-render scope minimal and avoids prop drilling.
            </li>
            <li>
              <strong>Lift to minimal common ancestor</strong> when two or more siblings (or sibling trees) need to read/write the same state. Not “as high as possible” — only as high as necessary.
            </li>
            <li>
              <strong>Colocated too low:</strong> State in child A; child B needs it → cannot implement “filter list by search” or “show selected in detail” without lifting. Prevents feature growth.
            </li>
            <li>
              <strong>Lifted too high:</strong> All shared state in one root → any state change re-renders the whole tree. Use memo + stable props to narrow re-render scope, or refactor so state lives at minimal ancestor.
            </li>
          </ul>
        </section>
      )}

      {mainSection === 'anti-pattern' && (
        <section className="placement-demo__concepts">
          <h2>When lifting becomes an anti-pattern</h2>
          <ul>
            <li>
              <strong>Lifted too high + deep tree:</strong> State at root → every intermediate (Layout, ContentArea) must forward props (prop drilling). One keystroke re-renders 6 components. Brittle: adding state means touching every layer.
            </li>
            <li>
              <strong>Memo band-aid:</strong> We add memo(Detail) so Detail skips re-render. We didn’t fix the tree: Layout and ContentArea still re-render and drill 8 props. Memo fixes a symptom, not the structure.
            </li>
            <li>
              <strong>Refactored correctly:</strong> State at <strong>minimal common ancestor</strong> (ContentArea). Dashboard and Layout don’t receive state → they don’t re-render on filter/selection change. Blast radius: 3 components (ContentArea, Filters, List) instead of 6. No prop drilling through Layout.
            </li>
          </ul>
        </section>
      )}

      {mainSection === 'basics' && basicsSection === 'colocated' && <ColocatedTooLow />}
      {mainSection === 'basics' && basicsSection === 'lifted' && <LiftedTooHigh />}
      {mainSection === 'basics' && basicsSection === 'balanced' && <BalancedState />}
      {mainSection === 'anti-pattern' && antiPatternSection === 'lifted-deep' && <LiftedTooHighDeep />}
      {mainSection === 'anti-pattern' && antiPatternSection === 'memo-band-aid' && <MemoBandAid />}
      {mainSection === 'anti-pattern' && antiPatternSection === 'refactored' && <RefactoredCorrectly />}
    </main>
  )
}
