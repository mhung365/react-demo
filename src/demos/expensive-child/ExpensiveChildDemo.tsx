import { useState } from 'react'
import { ParentBroken } from './ParentBroken'
import { ParentFixed } from './ParentFixed'
import './expensive-child-demo.css'

/**
 * Demo: why a component re-renders even when props "look the same".
 * - Broken: inline object/function → new refs every render → React.memo fails.
 * - Fixed: useMemo/useCallback → same refs → memo skips re-render.
 * Open console to see [props] value vs reference logs and [expensive] render cost.
 */
export function ExpensiveChildDemo() {
  const [mode, setMode] = useState<'broken' | 'fixed'>('broken')

  return (
    <main className="expensive-child-demo">
      <header className="demo-header">
        <h1>Why re-render when props don’t “change”?</h1>
        <p className="subtitle">
          “Props look the same” (value) ≠ “props are referentially equal” (===). React.memo uses reference equality.
        </p>
        <div className="tabs">
          <button
            type="button"
            className={mode === 'broken' ? 'active' : ''}
            onClick={() => setMode('broken')}
          >
            Broken (inline props)
          </button>
          <button
            type="button"
            className={mode === 'fixed' ? 'active' : ''}
            onClick={() => setMode('fixed')}
          >
            Fixed (useMemo + useCallback)
          </button>
        </div>
      </header>

      <section className="concepts">
        <h2>Concepts</h2>
        <ul>
          <li>
            <strong>Value equal</strong> — same content (e.g. <code>{`{ theme: 'dark' }`}</code> vs <code>{`{ theme: 'dark' }`}</code>). JSON or deep compare.
          </li>
          <li>
            <strong>Reference equal</strong> — same object/function in memory (<code>===</code>). React.memo uses this.
          </li>
          <li>
            Inline <code>{`config={{ theme: 'dark' }}`}</code> or <code>{`onClick={() => {}}`}</code> create a NEW reference every render → memo cannot skip.
          </li>
          <li>
            <code>useMemo</code> / <code>useCallback</code> with stable deps return the same reference → memo can skip.
          </li>
        </ul>
      </section>

      {mode === 'broken' ? <ParentBroken /> : <ParentFixed />}
    </main>
  )
}
