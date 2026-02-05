import { useState } from 'react'
import { UnstableCallbackParent } from './UnstableCallbackParent'
import { StableCallbackParent } from './StableCallbackParent'
import { NoBenefitUseCallback } from './NoBenefitUseCallback'
import { NoBenefitSimplified } from './NoBenefitSimplified'
import { RefactorNoCallback } from './RefactorNoCallback'
import './use-callback-demo.css'

type Section = 'unstable' | 'stable' | 'no-benefit' | 'simplified' | 'refactor'

/**
 * Demo: Does useCallback solve the root cause of re-renders, or only treat symptoms?
 *
 * - useCallback does NOT stop the parent from re-rendering (root cause: parent state changed).
 * - useCallback fixes REFERENCE INSTABILITY: same function reference across renders so memoized children
 *   can skip re-render (symptom: child was re-rendering because callback was a new ref every time).
 * - When the child is NOT memoized, useCallback adds complexity with no benefit (child re-renders anyway).
 * - Refactor: change architecture (e.g. context provides callback) so parent doesn't need to pass callback — no useCallback in parent.
 */
export function UseCallbackDemo() {
  const [section, setSection] = useState<Section>('unstable')

  return (
    <main className="callback-demo">
      <header className="callback-demo__header">
        <h1>useCallback: root cause vs symptoms</h1>
        <p className="callback-demo__subtitle">
          useCallback does <strong>not</strong> fix the root cause of re-renders (parent re-renders when its state changes). It fixes <strong>reference instability</strong>: a stable function reference so memoized children can skip re-render when the callback &quot;behavior&quot; hasn&apos;t changed. When the child isn&apos;t memoized, useCallback adds complexity with no benefit. You can also remove the need for useCallback by changing architecture (e.g. context provides the callback).
        </p>
        <div className="callback-demo__tabs">
          <button
            type="button"
            className={section === 'unstable' ? 'active' : ''}
            onClick={() => setSection('unstable')}
          >
            Unstable callback
          </button>
          <button
            type="button"
            className={section === 'stable' ? 'active' : ''}
            onClick={() => setSection('stable')}
          >
            useCallback necessary
          </button>
          <button
            type="button"
            className={section === 'no-benefit' ? 'active' : ''}
            onClick={() => setSection('no-benefit')}
          >
            No benefit useCallback
          </button>
          <button
            type="button"
            className={section === 'simplified' ? 'active' : ''}
            onClick={() => setSection('simplified')}
          >
            Simplified (no useCallback)
          </button>
          <button
            type="button"
            className={section === 'refactor' ? 'active' : ''}
            onClick={() => setSection('refactor')}
          >
            Refactor (context)
          </button>
        </div>
      </header>

      <section className="callback-demo__concepts">
        <h2>Reference instability vs architecture</h2>
        <ul>
          <li>
            <strong>Function identity across renders:</strong> Inline <code>{`() => { ... }`}</code> creates a new function every render → new reference. Memoized child shallow-compares: prevProps.onClick !== nextProps.onClick → child re-renders.
          </li>
          <li>
            <strong>useCallback fixes a real issue when:</strong> You have a memoized child that receives the callback. useCallback stabilizes the reference so when parent re-renders for unrelated state (e.g. count), the child gets the same ref → memo skips. useCallback &quot;treats the symptom&quot; (unstable reference) so memo can do its job.
          </li>
          <li>
            <strong>useCallback adds complexity with no benefit when:</strong> The child is not memoized. The child re-renders when the parent re-renders regardless of callback identity. Removing useCallback: simpler code, same behavior.
          </li>
          <li>
            <strong>Fixing reference instability vs fixing architecture:</strong> useCallback = fix reference instability (same ref so memo can skip). Refactoring = e.g. context provides the callback so the parent doesn&apos;t pass it — no useCallback in parent, architecture change removes the need.
          </li>
          <li>
            <strong>Root cause:</strong> Parent re-renders because its state changed. useCallback doesn&apos;t stop that. It only ensures the callback reference is stable so that memoized children don&apos;t re-render unnecessarily.
          </li>
        </ul>
      </section>

      {section === 'unstable' && <UnstableCallbackParent />}
      {section === 'stable' && <StableCallbackParent />}
      {section === 'no-benefit' && <NoBenefitUseCallback />}
      {section === 'simplified' && <NoBenefitSimplified />}
      {section === 'refactor' && <RefactorNoCallback />}
    </main>
  )
}
